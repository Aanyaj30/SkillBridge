import { callLLM } from "../aiProvider.js";

/**
 * AGENT 5 — GUIDE AGENT
 * 
 * Responsibilities:
 * - Generates personalized, job-specific learning roadmaps for missing/weak skills
 * - Explains WHY each skill matters for the specific target job
 * - Provides actionable step-by-step learning paths
 * - Recommends ranked resources (#1, #2, #3) with explicit rationale
 * - Recommends legitimate certifications ONLY when genuinely useful
 */

export const generatePersonalizedGuide = async ({
  jobTitle,
  requiredSkills = [],
  demonstratedSkills = [],
  missingSkills = [],
}) => {
  const skillsToTarget =
    missingSkills.length > 0
      ? missingSkills
      : requiredSkills.filter(
          (req) => !demonstratedSkills.some((ds) => ds.toLowerCase().includes(req.toLowerCase()))
        );

  if (skillsToTarget.length === 0) {
    return {
      allSkillsDemonstrated: true,
      message: "You have demonstrated strong alignment with all primary required skills for this role!",
      skillsToImprove: [],
    };
  }

  const systemInstruction = `You are the SkillBridge Career & Learning Guide Agent.
Create an actionable, high-quality, job-specific learning guide for a candidate applying to: "${jobTitle}".

JOB TITLE: ${jobTitle}
JOB REQUIRED SKILLS: ${requiredSkills.join(", ")}
CANDIDATE DEMONSTRATED SKILLS: ${demonstratedSkills.join(", ") || "None"}
SKILLS NEEDING IMPROVEMENT / MISSING EVIDENCE: ${skillsToTarget.join(", ")}

RULES:
1. TARGETED & RELEVANT:
   - For every skill needing improvement, explain specifically WHY it matters for this role of "${jobTitle}".
2. ACTIONABLE ROADMAP:
   - Provide 3 to 5 realistic, step-by-step milestones.
   - Include estimated time / practical task for each step (e.g. "Step 1: Learn REST API principles & HTTP verbs (2-3 hrs)", "Step 2: Build an API integration with Axios (3 hrs)", "Step 3: Handle error boundaries & loading states (2 hrs)", "Step 4: Build a mini full-stack demo project (4-5 hrs)").
3. RANKED RESOURCES:
   - Provide 3 ranked resources per skill (Rank 1 is the most authoritative/recommended).
   - Use reputable platforms: Official Docs (MDN, React.dev, etc.), freeCodeCamp, Coursera, YouTube, etc.
   - Include a concise 'reason' why this resource was chosen.
4. CERTIFICATIONS:
   - Suggest 1 or 2 reputable industry certifications ONLY when genuinely valuable for this skill (e.g., AWS Certified Developer, Meta Front-End Developer, MongoDB Certified Associate).
   - If no prominent certification is standard, provide an empty array. Do not invent fake certifications.

Respond strictly with valid JSON conforming to the schema.`;

  const responseSchema = {
    type: "OBJECT",
    properties: {
      skillsToImprove: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            skill: { type: "STRING" },
            whyItMatters: { type: "STRING" },
            currentStatus: {
              type: "STRING",
              enum: ["Insufficient evidence", "Beginner", "Needs refresh"],
            },
            roadmap: {
              type: "ARRAY",
              items: { type: "STRING" },
            },
            resources: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  rank: { type: "INTEGER" },
                  name: { type: "STRING" },
                  url: { type: "STRING" },
                  reason: { type: "STRING" },
                },
                required: ["rank", "name", "url", "reason"],
              },
            },
            certifications: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  name: { type: "STRING" },
                  provider: { type: "STRING" },
                  reason: { type: "STRING" },
                },
                required: ["name", "provider", "reason"],
              },
            },
          },
          required: [
            "skill",
            "whyItMatters",
            "currentStatus",
            "roadmap",
            "resources",
            "certifications",
          ],
        },
      },
      overallAdvice: { type: "STRING" },
    },
    required: ["skillsToImprove"],
  };

  const result = await callLLM({
    systemInstruction,
    userContent: "Generate the personalized SkillBridge learning guide.",
    responseSchema,
    temperature: 0.2,
  });

  return {
    allSkillsDemonstrated: (result.skillsToImprove || []).length === 0,
    skillsToImprove: result.skillsToImprove || [],
    overallAdvice: result.overallAdvice || "",
  };
};
