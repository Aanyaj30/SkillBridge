import axios from "axios";

// AI Provider Abstraction Layer
// This isolates LLM communication so that changing providers (e.g. to SAP Generative AI Hub)
// does not affect any controllers, agents, or client-facing logic.

const PRIMARY_MODEL = process.env.PRIMARY_GEMINI_MODEL || "gemini-3.8-flash";
const FALLBACK_MODEL = process.env.FALLBACK_GEMINI_MODEL || "gemini-3.5-flash-lite";

const getGeminiEndpoint = (model) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

// Sleep helper with jitter
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isTransientError = (error) => {
  const status = error.response?.status;
  if (status) {
    return [408, 429, 500, 502, 503, 504].includes(status);
  }
  // Network errors or timeouts
  const code = error.code;
  return ["ECONNABORTED", "ETIMEDOUT", "ENOTFOUND", "ECONNRESET"].includes(code) ||
    error.message?.toLowerCase().includes("timeout");
};

/**
 * Call a single Gemini model with exponential backoff for transient errors.
 */
const callModelWithRetry = async (model, payload, apiKey, maxRetries = 2) => {
  const url = `${getGeminiEndpoint(model)}?key=${apiKey}`;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" },
        timeout: 45000,
      });

      const candidates = response.data?.candidates;
      if (!candidates || candidates.length === 0) {
        throw new Error(`No response candidates received from model ${model}.`);
      }

      const rawText = candidates[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error(`Empty text content received from model ${model}.`);
      }

      // Clean markdown code blocks if wrapped
      let cleaned = rawText.trim();
      if (cleaned.startsWith("```json")) {
        cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      return {
        data: JSON.parse(cleaned),
        modelUsed: model,
      };
    } catch (error) {
      const isTransient = isTransientError(error);
      const status = error.response?.status;
      const errorDetails = error.response?.data?.error?.message || error.message;

      // Do NOT retry permanent errors (400, 401, 403, 404) or on last attempt
      if (!isTransient || attempt === maxRetries) {
        throw Object.assign(new Error(errorDetails), {
          status,
          isTransient,
          model,
        });
      }

      // Exponential backoff with jitter
      const delay = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 400, 5000);
      console.warn(
        `[AI Provider] ${model} transient failure (${status || error.code || "timeout"}). Retrying attempt ${attempt + 1}/${maxRetries} in ${Math.round(delay)}ms...`
      );
      await wait(delay);
    }
  }
};

/**
 * Call the AI provider with system instructions, user prompt, and JSON response schema.
 * Automatically fails over from primary model to secondary supported model on transient errors.
 * @param {Object} options
 * @param {string} options.systemInstruction - The system role/prompt.
 * @param {string} options.userContent - The user query/input.
 * @param {Object} options.responseSchema - OpenAPI/JSON schema for structured output.
 * @param {number} [options.temperature=0.2] - Sampling temperature.
 * @returns {Promise<Object>} Parsed JSON response.
 */
export const callLLM = async ({
  systemInstruction,
  userContent,
  responseSchema,
  temperature = 0.2,
}) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("AI Provider Error: GEMINI_API_KEY is not configured.");
  }

  const payload = {
    systemInstruction: {
      parts: [{ text: systemInstruction }],
    },
    contents: [
      {
        role: "user",
        parts: [{ text: userContent }],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      temperature,
    },
  };

  if (responseSchema) {
    payload.generationConfig.responseSchema = responseSchema;
  }

  // 1. Try Primary Model with retry
  try {
    const result = await callModelWithRetry(PRIMARY_MODEL, payload, apiKey, 2);
    return result.data;
  } catch (primaryError) {
    // If error is permanent (like auth 401/403 or invalid schema 400), don't call fallback
    if (!primaryError.isTransient && primaryError.status && [400, 401, 403].includes(primaryError.status)) {
      console.error(`[AI Provider] Permanent error on ${PRIMARY_MODEL}:`, primaryError.message);
      throw new Error(`AI Provider Error: ${primaryError.message}`);
    }

    // 2. Failover to Secondary Supported Model with exact same semantic payload
    console.warn(
      `[AI Provider] Primary model ${PRIMARY_MODEL} unavailable (${primaryError.status || primaryError.message}). Failing over to secondary model ${FALLBACK_MODEL}...`
    );

    try {
      const fallbackResult = await callModelWithRetry(FALLBACK_MODEL, payload, apiKey, 2);
      console.log(`[AI Provider] Secondary model ${FALLBACK_MODEL} successfully fulfilled request.`);
      return fallbackResult.data;
    } catch (fallbackError) {
      console.error(
        `[AI Provider] Both primary (${PRIMARY_MODEL}) and secondary (${FALLBACK_MODEL}) models failed.`,
        fallbackError.message
      );
      throw new Error(
        `AI Provider Error: Both primary and fallback AI models are currently experiencing high demand. Please try again in a moment.`
      );
    }
  }
};

export { PRIMARY_MODEL, FALLBACK_MODEL };
