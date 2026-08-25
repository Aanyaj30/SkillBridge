import axios from "axios";

// This is the ONLY file in the whole backend that talks to an AI provider.
// Every controller calls the functions below, never the AI API directly.
// This is deliberate: when you swap to SAP Generative AI Hub later, you
// only ever touch this one file — nothing else in the app changes.

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

// Takes a raw job description and returns the specific professional
// skills it requires — used when an employer posts a job.
export const extractRequiredSkillsFromDescription = async (description) => {
  const systemInstruction = `You are an expert recruiter. Extract the specific professional skills required by this job description.

Rules:
- Extract between 4 and 8 skills.
- Use standard, specific professional skill names (e.g. "Budget Management", "Stakeholder Communication") — not vague traits like "team player."
- Base skills only on what the description actually implies.

Respond ONLY with valid JSON in exactly this shape, no other text:
{"skills": ["Skill Name", "Skill Name"]}`;

  const responseSchema = {
    type: "OBJECT",
    properties: {
      skills: { type: "ARRAY", items: { type: "STRING" } },
    },
    required: ["skills"],
  };

  const response = await axios.post(
    GEMINI_URL,
    {
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: [{ role: "user", parts: [{ text: description }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.3,
      },
    },
    {
      headers: {
        "x-goog-api-key": process.env.GEMINI_API_KEY,
        "Content-Type": "application/json",
      },
    },
  );

  const raw = response.data.candidates[0].content.parts[0].text;
  return JSON.parse(raw).skills; // ["Skill Name", ...]
};

// Takes the candidate's interview answers (array of { question, answer })
// and returns a list of extracted professional skills.
export const extractSkillsFromInterview = async (interviewAnswers) => {
  // Combine all Q&A into one readable block for the AI to read
  const transcript = interviewAnswers
    .map((qa) => `Q: ${qa.question}\nA: ${qa.answer}`)
    .join("\n\n");

  const systemInstruction = `You are an expert HR analyst. Your job is to extract genuine, professional, transferable skills from a person's description of everyday activities during a career break.

Rules:
- Only extract skills that are clearly and specifically implied by what they wrote.
- Use standard professional skill names (e.g. "Budget Management", not "good with money").
- Extract between 4 and 8 skills. Do not pad with vague or generic skills like "hard worker" or "dedicated."
- For each skill, include a short "source" phrase — the specific thing they said that implies this skill.`;

  // responseSchema forces Gemini to return exactly this shape — no parsing
  // around extra text, no markdown code fences to strip out.
  const responseSchema = {
    type: "OBJECT",
    properties: {
      skills: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            name: { type: "STRING" },
            source: { type: "STRING" },
          },
          required: ["name", "source"],
        },
      },
    },
    required: ["skills"],
  };

  const response = await axios.post(
    GEMINI_URL,
    {
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: [{ role: "user", parts: [{ text: transcript }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.3, // lower = more consistent/predictable output, good for structured extraction
      },
    },
    {
      headers: {
        "x-goog-api-key": process.env.GEMINI_API_KEY,
        "Content-Type": "application/json",
      },
    },
  );

  const raw = response.data.candidates[0].content.parts[0].text;
  const parsed = JSON.parse(raw);
  return parsed.skills; // [{ name, source }]
};
