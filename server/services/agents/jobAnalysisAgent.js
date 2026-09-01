import { callLLM } from "../aiProvider.js";

/**
 * AGENT 1 — JOB ANALYSIS AGENT
 * 
 * Responsibilities:
 * - Understand job description
 * - Extract required skills
 * - Identify important/critical skills vs optional skills
 * - Understand role context & experience level
 * - Never invent skills that aren't reasonably supported by the description
 */
export const analyzeJobDescription = async (description, title = "") => {
  const systemInstruction = `You are an expert recruitment and job analysis AI agent for SkillBridge.

Analyze the given job posting and extract a structured skills breakdown.

Rules:
1. Extract 4 to 8 required skills that are genuinely essential for the role.
2. Separate them into 'requiredSkills' (all needed skills), 'importantSkills' (the core critical skills), and 'optionalSkills' (good-to-have skills).
3. Use standard, specific professional skill names (e.g. "React", "REST APIs", "SQL", "Team Coordination", "Project Planning").
4. Do NOT extract vague personality traits like "hard worker", "fast learner", "team player", or "motivated".
5. Do NOT invent skills that are not supported by the job description.
6. Identify the role title and experience level (Entry-level, Mid-level, Senior, Lead).

Respond strictly with valid JSON conforming to the schema.`;

  const userContent = `JOB TITLE: ${title || "Not specified"}\n\nJOB DESCRIPTION:\n${description}`;

  const responseSchema = {
    type: "OBJECT",
    properties: {
      role: { type: "STRING" },
      requiredSkills: {
        type: "ARRAY",
        items: { type: "STRING" },
      },
      importantSkills: {
        type: "ARRAY",
        items: { type: "STRING" },
      },
      optionalSkills: {
        type: "ARRAY",
        items: { type: "STRING" },
      },
      experienceLevel: { type: "STRING" },
      summary: { type: "STRING" },
    },
    required: ["role", "requiredSkills", "importantSkills", "optionalSkills", "experienceLevel"],
  };

  const result = await callLLM({
    systemInstruction,
    userContent,
    responseSchema,
    temperature: 0.2,
  });

  return {
    role: result.role || title || "Professional",
    requiredSkills: result.requiredSkills || [],
    importantSkills: result.importantSkills || result.requiredSkills || [],
    optionalSkills: result.optionalSkills || [],
    experienceLevel: result.experienceLevel || "Mid-level",
    summary: result.summary || "",
  };
};
