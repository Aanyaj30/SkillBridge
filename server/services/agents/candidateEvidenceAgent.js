import { callLLM } from "../aiProvider.js";

/**
 * AGENT 2 — CANDIDATE EVIDENCE AGENT
 * 
 * Responsibilities:
 * - Extract demonstrated skills from candidate sources (Resume, Projects, Work History, Certificates)
 * - Map evidence to skills
 * - Identify strength of evidence (High, Medium, Low) and confidence score (0.0 - 1.0)
 * - Identify transferable skills grounded in real activities
 * - Never create skills without concrete evidence
 */

/**
 * Extract structured skill evidence from full candidate profile context.
 */
export const extractCandidateEvidence = async ({
  resumeText = "",
  workHistory = [],
  projects = [],
  certificates = [],
  bio = "",
}) => {
  const sections = [];

  if (resumeText) {
    sections.push(`=== RESUME TEXT ===\n${resumeText}`);
  }

  if (workHistory && workHistory.length > 0) {
    const whFormatted = workHistory
      .map(
        (job, i) =>
          `[Job ${i + 1}] Title: ${job.title}, Company: ${job.company}, Dates: ${job.startDate ? new Date(job.startDate).toLocaleDateString() : ""} - ${job.endDate ? new Date(job.endDate).toLocaleDateString() : "Present"}`
      )
      .join("\n");
    sections.push(`=== WORK HISTORY ===\n${whFormatted}`);
  }

  if (projects && projects.length > 0) {
    const projFormatted = projects
      .map(
        (p, i) =>
          `[Project ${i + 1}] Title: ${p.title}\nDescription: ${p.description}\nTechnologies: ${(p.technologies || []).join(", ")}\nLink: ${p.link || "N/A"}`
      )
      .join("\n\n");
    sections.push(`=== PROJECTS ===\n${projFormatted}`);
  }

  if (certificates && certificates.length > 0) {
    const certFormatted = certificates
      .map(
        (c, i) =>
          `[Certificate ${i + 1}] Name: ${c.name}, Issuer: ${c.issuer}, Date: ${c.date || "N/A"}, Skills: ${(c.skills || []).join(", ")}`
      )
      .join("\n");
    sections.push(`=== CERTIFICATES ===\n${certFormatted}`);
  }

  if (bio) {
    sections.push(`=== CANDIDATE BIO / SUMMARY ===\n${bio}`);
  }

  const candidateEvidenceText = sections.join("\n\n");

  if (!candidateEvidenceText.trim()) {
    return { skills: [], summary: "No evidence provided." };
  }

  const systemInstruction = `You are an expert talent and skill evidence analyst for SkillBridge.

Extract demonstrated professional and technical skills with direct evidence from the candidate's profile.

Rules:
1. Extract ONLY skills supported by the provided candidate evidence.
2. For EVERY skill, specify:
   - 'skill': standard professional skill name (e.g. "React", "Node.js", "Team Coordination", "SQL", "REST APIs", "Project Management").
   - 'evidence': specific quote or factual summary from the candidate's information explaining how they demonstrated this skill.
   - 'source': one of "resume", "work_history", "project", "certificate", "profile".
   - 'confidence': confidence score from 0.50 to 1.00 based on the clarity and depth of evidence.
   - 'strength': "High" (deep/proven hands-on experience or complete project), "Medium" (competent demonstration/moderate scope), or "Low" (introductory/claimed).
3. Do NOT invent skills. If a skill is not clearly evidenced in the text, DO NOT include it.
4. Distinguish between technical skills (e.g. "React", "MongoDB") and demonstrated functional/transferable skills (e.g. "Team Coordination", "Client Communication", "Problem Solving").
5. Avoid generic filler traits (e.g. "Hard worker", "Enthusiastic").

Respond strictly with valid JSON conforming to the schema.`;

  const responseSchema = {
    type: "OBJECT",
    properties: {
      skills: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            skill: { type: "STRING" },
            evidence: { type: "STRING" },
            source: {
              type: "STRING",
              enum: ["resume", "work_history", "project", "certificate", "profile", "interview"],
            },
            confidence: { type: "NUMBER" },
            strength: {
              type: "STRING",
              enum: ["High", "Medium", "Low"],
            },
          },
          required: ["skill", "evidence", "source", "confidence", "strength"],
        },
      },
      summary: { type: "STRING" },
    },
    required: ["skills"],
  };

  const result = await callLLM({
    systemInstruction,
    userContent: candidateEvidenceText,
    responseSchema,
    temperature: 0.2,
  });

  return {
    skills: result.skills || [],
    summary: result.summary || "",
  };
};

/**
 * Extract skills from a single project.
 */
export const extractProjectSkills = async ({ title, description, technologies = [] }) => {
  const systemInstruction = `Extract demonstrated technical and practical skills from this project description.

Rules:
- Identify technologies and architectural/engineering practices used.
- Provide evidence grounded in the project description.
- Return structured JSON with skill, evidence, strength (High, Medium, Low), confidence (0.5 - 1.0).`;

  const userContent = `Project Title: ${title}\nDescription: ${description}\nTechnologies: ${technologies.join(", ")}`;

  const responseSchema = {
    type: "OBJECT",
    properties: {
      skills: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            skill: { type: "STRING" },
            evidence: { type: "STRING" },
            strength: { type: "STRING", enum: ["High", "Medium", "Low"] },
            confidence: { type: "NUMBER" },
          },
          required: ["skill", "evidence", "strength", "confidence"],
        },
      },
    },
    required: ["skills"],
  };

  const result = await callLLM({
    systemInstruction,
    userContent,
    responseSchema,
    temperature: 0.2,
  });

  return result.skills || [];
};

/**
 * Extract structured information and skills from raw resume text.
 */
export const parseResumeContent = async (resumeText) => {
  const systemInstruction = `You are a resume parsing AI. Extract structured candidate details and demonstrated skills from the raw resume text.

Rules:
- Extract candidate's summary/bio, work experiences, projects, education, and skills with supporting evidence.
- Do not hallucinate missing information.
- For skills, map each to evidence from the resume text.`;

  const responseSchema = {
    type: "OBJECT",
    properties: {
      bio: { type: "STRING" },
      workHistory: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" },
            company: { type: "STRING" },
            startDate: { type: "STRING" },
            endDate: { type: "STRING" },
            description: { type: "STRING" },
          },
          required: ["title", "company"],
        },
      },
      projects: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" },
            description: { type: "STRING" },
            technologies: {
              type: "ARRAY",
              items: { type: "STRING" },
            },
          },
          required: ["title", "description"],
        },
      },
      skills: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            skill: { type: "STRING" },
            evidence: { type: "STRING" },
            source: { type: "STRING" },
            confidence: { type: "NUMBER" },
            strength: { type: "STRING", enum: ["High", "Medium", "Low"] },
          },
          required: ["skill", "evidence", "strength", "confidence"],
        },
      },
    },
    required: ["skills"],
  };

  const result = await callLLM({
    systemInstruction,
    userContent: resumeText,
    responseSchema,
    temperature: 0.2,
  });

  return result;
};
