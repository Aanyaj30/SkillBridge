import axios from "axios";

// AI Provider Abstraction Layer
// This isolates LLM communication so that changing providers (e.g. to SAP Generative AI Hub)
// does not affect any controllers, agents, or client-facing logic.

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent";

/**
 * Call the AI provider with system instructions, user prompt, and JSON response schema.
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

  try {
    const response = await axios.post(
      `${GEMINI_URL}?key=${apiKey}`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 35000,
      }
    );

    const candidates = response.data?.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("No response candidates received from AI model.");
    }

    const rawText = candidates[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error("Empty text content received from AI model.");
    }

    // Clean potential markdown wrapping (```json ... ```)
    let cleaned = rawText.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    return JSON.parse(cleaned);
  } catch (error) {
    const errorDetails = error.response?.data?.error?.message || error.message;
    console.error("AI Provider call failed:", errorDetails);
    throw new Error(`AI Provider Error: ${errorDetails}`);
  }
};
