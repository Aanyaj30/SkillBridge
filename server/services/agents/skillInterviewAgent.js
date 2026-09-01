import { callLLM } from "../aiProvider.js";

/**
 * AGENT 3 — SKILL ASSESSMENT / INTERVIEW AGENT
 * 
 * Responsibilities:
 * - Conduct dynamic, job-specific adaptive interview
 * - Zero hardcoded questions: generates tailored questions targeting undemonstrated job skills
 * - Asks contextual follow-ups when candidate gives vague answers or makes unverified claims
 * - Understands English, Hindi, and Hinglish naturally without penalizing informal phrasing
 * - Extracts concrete evidence grounded in the candidate's answers
 * - Backend controls state, max question limit (8), and score computation
 */

/**
 * Generate the next dynamic interview question or conclude the assessment.
 */
export const generateNextInterviewQuestion = async ({
  jobTitle,
  jobDescription = "",
  requiredSkills = [],
  candidateContext = "",
  demonstratedSkills = [],
  missingSkills = [],
  interviewHistory = [],
}) => {
  const transcript =
    interviewHistory.length > 0
      ? interviewHistory
          .map(
            (qa, index) =>
              `[Question ${index + 1} (${qa.targetSkill ? `Target: ${qa.targetSkill}` : "General"})]: ${qa.question}\n[Candidate Answer]: ${qa.answer}\n[AI Analysis so far]: ${qa.analysis || "Demonstrated relevant evidence"}`
          )
          .join("\n\n")
      : "No questions asked yet. This is the start of the interview.";

  const skillsNeedingProof = missingSkills.length > 0 ? missingSkills : requiredSkills;

  const systemInstruction = `You are the SkillBridge Adaptive Skill Interview Agent.
You conduct an interactive, professional, evidence-discovering interview for a candidate applying for: "${jobTitle}".

JOB TITLE:
${jobTitle}

REQUIRED JOB SKILLS:
${requiredSkills.map((s) => `- ${s}`).join("\n")}

CANDIDATE PROFILE CONTEXT:
${candidateContext || "Candidate has applied for this role and needs to demonstrate their hands-on skills."}

ALREADY DEMONSTRATED SKILLS:
${demonstratedSkills.length > 0 ? demonstratedSkills.map((s) => `- ${s}`).join("\n") : "None yet"}

SKILLS STILL NEEDING EVIDENCE / VERIFICATION:
${skillsNeedingProof.map((s) => `- ${s}`).join("\n")}

INTERVIEW TRANSCRIPT SO FAR:
${transcript}

CRITICAL RULES:
1. FOCUS EXCLUSIVELY ON JOB-RELEVANT SKILLS:
   - For a Frontend role, ask about UI components, React/JS implementation, state management, APIs, responsive design, debugging.
   - For a Project Coordinator role, ask about task scheduling, cross-team communication, deadlines, conflict resolution, tracking tools.
   - NEVER ask about unrelated domains (e.g. do not ask a frontend engineer about budgeting or financial audits unless specifically required by the job).
2. ADAPTIVE FOLLOW-UP LOGIC:
   - If the candidate's previous answer made a claim (e.g. "I built a website" or "Maine team sambhali"), ask a direct, contextual follow-up to test depth:
     * "What specific part of the system did you personally design or code?"
     * "How did you handle error cases or edge cases?"
     * "Can you walk me through a difficult bug or challenge you resolved during that work?"
   - If the candidate has already provided strong, detailed evidence for a skill, move to the NEXT unverified required skill.
3. LANGUAGE AND INCLUSIVITY:
   - The candidate may speak English, Hindi, or Hinglish (e.g. "Maine React dashboard banaya tha aur API connect ki thi").
   - Understand Hindi / Hinglish accurately and extract the underlying professional competency without bias.
   - Keep your questions encouraging, clear, and professional.
4. COMPLETION CONDITIONS:
   - If all critical required skills have sufficient evidence OR the candidate has answered all major areas well, set 'shouldContinue' to false, 'completed' to true, and 'question' to "".
   - Do NOT ask repetitive or superficial questions.

Respond strictly with valid JSON conforming to the schema.`;

  const responseSchema = {
    type: "OBJECT",
    properties: {
      shouldContinue: { type: "BOOLEAN" },
      targetSkill: { type: "STRING" },
      question: { type: "STRING" },
      reasoning: { type: "STRING" },
      completed: { type: "BOOLEAN" },
    },
    required: ["shouldContinue", "targetSkill", "question", "reasoning", "completed"],
  };

  const result = await callLLM({
    systemInstruction,
    userContent: "Determine the best next dynamic question or finish if sufficient evidence is captured.",
    responseSchema,
    temperature: 0.3,
  });

  return result;
};

/**
 * Analyze a candidate's answer to an interview question.
 */
export const analyzeInterviewAnswer = async ({
  jobTitle,
  requiredSkills = [],
  targetSkill = "",
  question,
  answer,
  interviewHistory = [],
}) => {
  const systemInstruction = `You are an expert skills evaluator for SkillBridge.
Analyze the candidate's answer to an interview question and extract verified skills with evidence quotes.

JOB ROLE: ${jobTitle}
REQUIRED SKILLS: ${requiredSkills.join(", ")}
TARGET SKILL FOR THIS QUESTION: ${targetSkill || "Job-relevant capabilities"}

QUESTION ASKED:
${question}

CANDIDATE'S ANSWER:
${answer}

EVALUATION RULES:
1. UNDERSTAND HINGLISH/HINDI/ENGLISH:
   - Accurately interpret responses in English, Hindi, or conversational Hinglish (e.g., "Maine 5 logon ka work plan banaya aur daily standup kiya" -> Team Coordination, Task Planning, Agile Communication).
2. EVIDENCE STRENGTH:
   - "High": Candidate gives concrete details, specific implementation steps, numbers, problems faced, and how they solved them.
   - "Medium": Candidate explains their role and practical actions, with moderate detail.
   - "Low": Candidate makes general claims without explaining how they did it.
3. EXTRACT GENUINE SKILLS ONLY:
   - Extract only skills that are grounded in what the candidate actually described.
   - Never invent or assume skills not mentioned in the answer.
4. FOLLOW-UP DECISION:
   - If the candidate's answer is brief, vague, or mentions an interesting accomplishment without detail, set 'needsFollowUp: true' and suggest 'followUpQuestion'.
   - If the answer was thorough and demonstrated the skill, set 'needsFollowUp: false'.

Respond strictly with valid JSON conforming to the schema.`;

  const responseSchema = {
    type: "OBJECT",
    properties: {
      analysis: { type: "STRING" },
      claims: {
        type: "ARRAY",
        items: { type: "STRING" },
      },
      skills: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            name: { type: "STRING" },
            evidence: { type: "STRING" },
            confidence: { type: "NUMBER" },
            strength: { type: "STRING", enum: ["High", "Medium", "Low"] },
          },
          required: ["name", "evidence", "confidence", "strength"],
        },
      },
      isEvidenceSufficient: { type: "BOOLEAN" },
      needsFollowUp: { type: "BOOLEAN" },
      suggestedFollowUp: { type: "STRING" },
    },
    required: ["analysis", "skills", "isEvidenceSufficient", "needsFollowUp"],
  };

  const result = await callLLM({
    systemInstruction,
    userContent: "Evaluate this interview response and extract demonstrated skill evidence.",
    responseSchema,
    temperature: 0.2,
  });

  return result;
};

/**
 * Synthesize all interview turns into a final consolidated skill evidence array.
 */
export const extractSkillsFromCompleteInterview = async ({
  jobTitle,
  requiredSkills = [],
  interviewAnswers = [],
}) => {
  if (!interviewAnswers || interviewAnswers.length === 0) {
    return [];
  }

  const transcript = interviewAnswers
    .map(
      (qa, i) =>
        `[Q${i + 1} (${qa.targetSkill || "General"})]: ${qa.question}\n[Answer]: ${qa.answer}`
    )
    .join("\n\n");

  const systemInstruction = `You are a talent evaluation AI.
Synthesize the complete interview transcript into a consolidated list of demonstrated skills and verified evidence for the role of "${jobTitle}".

Rules:
1. Extract every distinct professional, technical, and transferable skill demonstrated across the interview.
2. Formulate a concise, clear 'evidence' statement quoting or summarizing the candidate's direct statements.
3. Set 'source' to "interview".
4. Assign 'confidence' (0.60 to 1.00) and 'strength' ("High", "Medium", "Low").
5. Do NOT invent skills.

Respond strictly with valid JSON conforming to the schema.`;

  const responseSchema = {
    type: "OBJECT",
    properties: {
      skills: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            name: { type: "STRING" },
            evidence: { type: "STRING" },
            source: { type: "STRING" },
            confidence: { type: "NUMBER" },
            strength: { type: "STRING", enum: ["High", "Medium", "Low"] },
          },
          required: ["name", "evidence", "source", "confidence", "strength"],
        },
      },
      summary: { type: "STRING" },
    },
    required: ["skills"],
  };

  const result = await callLLM({
    systemInstruction,
    userContent: transcript,
    responseSchema,
    temperature: 0.2,
  });

  return result.skills || [];
};
