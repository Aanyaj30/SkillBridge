import { callLLM } from "../aiProvider.js";

/**
 * AGENT 4 — MATCHING / EVALUATION AGENT
 * 
 * Responsibilities:
 * - Combines job requirements with multi-source candidate evidence (Resume, Projects, Work History, Certificates, Interview)
 * - Produces an explainable, audit-ready evaluation
 * - Pinpoints exactly where each demonstrated skill originated (source and quote)
 * - Generates clear recruiter-friendly explanations for why SkillBridge discovered additional capability
 * - Identifies if the candidate is potentially overlooked by traditional ATS screening
 * - NOTE: Actual numeric scores are calculated deterministically by the scoring engine (matching.js)
 */

export const evaluateMatchEvidence = async ({
  jobTitle,
  requiredSkills = [],
  importantSkills = [],
  optionalSkills = [],
  candidateEvidence = [],
  interviewAnswers = [],
  workHistory = [],
}) => {
  const systemInstruction = `You are the SkillBridge Matching & Evaluation AI Agent.

Analyze the alignment between the job requirements and the candidate's multi-source evidence (Projects, Work History, Certificates, Resume, Dynamic Interview).

JOB TITLE:
${jobTitle}

REQUIRED SKILLS:
${requiredSkills.map((s) => `- ${s}`).join("\n")}

IMPORTANT / CORE SKILLS:
${(importantSkills.length ? importantSkills : requiredSkills).map((s) => `- ${s}`).join("\n")}

CANDIDATE DEMONSTRATED EVIDENCE ITEMS:
${
  candidateEvidence.length > 0
    ? candidateEvidence
        .map(
          (e, i) =>
            `[Evidence ${i + 1}] Skill: ${e.skill || e.name} | Source: ${e.source} | Strength: ${e.strength || "Medium"} | Details: "${e.evidence}"`
        )
        .join("\n")
    : "No direct evidence provided yet."
}

INTERVIEW TRANSCRIPT / Q&A:
${
  interviewAnswers.length > 0
    ? interviewAnswers
        .map((qa, i) => `Q${i + 1}: ${qa.question}\nA: ${qa.answer}`)
        .join("\n\n")
    : "No dynamic interview taken."
}

RULES:
1. MATCHING:
   - Match required job skills against candidate evidence.
   - For every matched skill, link the strongest piece of evidence and its exact source ("project", "work_history", "interview", "certificate", "resume").
2. MISSING SKILLS:
   - Identify which required skills still have zero or insufficient evidence.
3. EXPLANATION:
   - Provide a clear, objective explanation highlighting why SkillBridge discovered capabilities that a traditional resume parser would miss.
   - Explain how non-traditional sources (e.g. dynamic interview, open source projects, practical experience) proved their competence.
4. OVERLOOKED CANDIDATE LOGIC:
   - If traditional resume keyword matching would rate this candidate low (e.g. due to career gap, non-traditional background, or skills hidden in projects/interviews) but demonstrated evidence is high, explain why they are "Potentially overlooked by traditional screening".
   - Use objective, professional language: never claim malicious bias or illegal discrimination, emphasize "unrepresented capability beyond conventional keyword screening".

Respond strictly with valid JSON conforming to the schema.`;

  const responseSchema = {
    type: "OBJECT",
    properties: {
      matchedSkills: {
        type: "ARRAY",
        items: { type: "STRING" },
      },
      missingSkills: {
        type: "ARRAY",
        items: { type: "STRING" },
      },
      skillEvidence: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            skill: { type: "STRING" },
            evidence: { type: "STRING" },
            source: {
              type: "STRING",
              enum: ["project", "work_history", "interview", "certificate", "resume", "profile"],
            },
            strength: { type: "STRING", enum: ["High", "Medium", "Low"] },
            confidence: { type: "NUMBER" },
          },
          required: ["skill", "evidence", "source", "strength", "confidence"],
        },
      },
      strengths: {
        type: "ARRAY",
        items: { type: "STRING" },
      },
      recommendations: {
        type: "ARRAY",
        items: { type: "STRING" },
      },
      explanation: { type: "STRING" },
      whyScoreImproved: { type: "STRING" },
    },
    required: [
      "matchedSkills",
      "missingSkills",
      "skillEvidence",
      "strengths",
      "explanation",
      "whyScoreImproved",
    ],
  };

  const result = await callLLM({
    systemInstruction,
    userContent: "Evaluate candidate evidence against job requirements.",
    responseSchema,
    temperature: 0.2,
  });

  return result;
};
