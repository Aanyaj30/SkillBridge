import { callLLM } from "../aiProvider.js";

/**
 * AGENT 5 — GUIDE AGENT
 * 
 * Responsibilities:
 * - Generates personalized, job-specific learning roadmaps for genuine missing/unverified skills
 * - Explains WHY each skill matters for the specific target job
 * - Provides actionable step-by-step learning sequences
 * - Specifies concrete practical tasks and project application ideas
 * - Defines exact evidence the candidate must produce to verify the skill
 * - Outlines how SkillBridge will re-verify the skill
 * - Recommends verified authoritative learning resources (official docs, MDN, freeCodeCamp)
 */

// Authoritative verified documentation/tutorial registry to eliminate URL hallucinations
const AUTHORITATIVE_RESOURCE_REGISTRY = {
  react: {
    official: { name: "React Official Documentation & Interactive Tutorial", url: "https://react.dev/learn", type: "Official Documentation" },
    freecodecamp: { name: "freeCodeCamp Full React Course", url: "https://www.freecodecamp.org/news/learn-react-beginners-handbook/", type: "Interactive Guide" },
    mdn: { name: "MDN Web Docs: Getting Started with React", url: "https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Client-side_JavaScript_frameworks/React_getting_started", type: "Tutorial" },
  },
  "node.js": {
    official: { name: "Node.js Official Documentation & Guides", url: "https://nodejs.org/en/learn", type: "Official Documentation" },
    mdn: { name: "MDN Express & Node.js Tutorial", url: "https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs", type: "Tutorial" },
    freecodecamp: { name: "freeCodeCamp Node.js & Express Certification", url: "https://www.freecodecamp.org/learn/back-end-development-and-apis/", type: "Hands-on Platform" },
  },
  nodejs: {
    official: { name: "Node.js Official Documentation & Guides", url: "https://nodejs.org/en/learn", type: "Official Documentation" },
    mdn: { name: "MDN Express & Node.js Tutorial", url: "https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs", type: "Tutorial" },
  },
  typescript: {
    official: { name: "TypeScript Official Handbook", url: "https://www.typescriptlang.org/docs/handbook/intro.html", type: "Official Documentation" },
    freecodecamp: { name: "freeCodeCamp TypeScript Handbook", url: "https://www.freecodecamp.org/news/learn-typescript-beginners-guide/", type: "Tutorial" },
  },
  javascript: {
    official: { name: "MDN JavaScript Official Reference & Guide", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript", type: "Official Documentation" },
    freecodecamp: { name: "freeCodeCamp JavaScript Algorithms & Data Structures", url: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/", type: "Interactive Platform" },
  },
  docker: {
    official: { name: "Docker Official Getting Started Guide", url: "https://docs.docker.com/get-started/", type: "Official Documentation" },
    freecodecamp: { name: "freeCodeCamp Docker Handbook", url: "https://www.freecodecamp.org/news/the-docker-handbook/", type: "Tutorial" },
  },
  sql: {
    official: { name: "PostgreSQL Official Documentation & Tutorial", url: "https://www.postgresql.org/docs/current/tutorial.html", type: "Official Documentation" },
    interactive: { name: "SQLBolt Interactive Lessons", url: "https://sqlbolt.com/", type: "Interactive Practice" },
  },
  postgresql: {
    official: { name: "PostgreSQL Official Documentation & Tutorial", url: "https://www.postgresql.org/docs/current/tutorial.html", type: "Official Documentation" },
    interactive: { name: "SQLBolt Interactive Lessons", url: "https://sqlbolt.com/", type: "Interactive Practice" },
  },
  mongodb: {
    official: { name: "MongoDB Official University & Docs", url: "https://www.mongodb.com/docs/manual/tutorial/getting-started/", type: "Official Documentation" },
    freecodecamp: { name: "freeCodeCamp MongoDB Full Course", url: "https://www.freecodecamp.org/news/learn-mongodb-a43fc40e0ee5/", type: "Tutorial" },
  },
  "rest apis": {
    official: { name: "MDN Guide to RESTful APIs & HTTP Methods", url: "https://developer.mozilla.org/en-US/docs/Learn/Server-side/First_steps/Web_frameworks", type: "Official Documentation" },
    guide: { name: "RESTful API Design Best Practices", url: "https://restfulapi.net/", type: "Reference Architecture" },
  },
  python: {
    official: { name: "Python Official Tutorial", url: "https://docs.python.org/3/tutorial/", type: "Official Documentation" },
    freecodecamp: { name: "freeCodeCamp Scientific Computing with Python", url: "https://www.freecodecamp.org/learn/scientific-computing-with-python/", type: "Hands-on Platform" },
  },
  git: {
    official: { name: "Pro Git Official Book & Documentation", url: "https://git-scm.com/book/en/v2", type: "Official Documentation" },
    github: { name: "GitHub Skills Interactive Labs", url: "https://skills.github.com/", type: "Interactive Labs" },
  },
  aws: {
    official: { name: "AWS Official Getting Started Resource Center", url: "https://aws.amazon.com/getting-started/", type: "Official Documentation" },
    freecodecamp: { name: "freeCodeCamp AWS Cloud Practitioner Full Course", url: "https://www.freecodecamp.org/news/aws-certified-cloud-practitioner-study-course/", type: "Video Tutorial" },
  },
  kubernetes: {
    official: { name: "Kubernetes Official Interactive Basics", url: "https://kubernetes.io/docs/tutorials/kubernetes-basics/", type: "Official Documentation" },
  },
  graphql: {
    official: { name: "GraphQL Official Introduction & Tutorial", url: "https://graphql.org/learn/", type: "Official Documentation" },
  },
  tailwindcss: {
    official: { name: "Tailwind CSS Official Documentation", url: "https://tailwindcss.com/docs", type: "Official Documentation" },
  },
};

/**
 * Validate and ground resource URLs with authoritative sources.
 */
const validateAndGroundResources = (skillName, rawResources = []) => {
  const normSkill = skillName.toLowerCase().trim();
  const known = AUTHORITATIVE_RESOURCE_REGISTRY[normSkill];

  const validated = [];
  const trustedDomains = [
    "react.dev",
    "nodejs.org",
    "developer.mozilla.org",
    "typescriptlang.org",
    "docs.docker.com",
    "postgresql.org",
    "mongodb.com",
    "docs.python.org",
    "git-scm.com",
    "aws.amazon.com",
    "kubernetes.io",
    "graphql.org",
    "tailwindcss.com",
    "freecodecamp.org",
    "coursera.org",
    "youtube.com",
    "restfulapi.net",
    "sqlbolt.com",
    "scrum.org",
    "jestjs.io",
    "github.com",
  ];

  (rawResources || []).forEach((res, index) => {
    let url = (res.url || "").trim();
    const isUrl = url.startsWith("http://") || url.startsWith("https://");
    const isTrusted = isUrl && trustedDomains.some((d) => url.toLowerCase().includes(d));

    if (isTrusted) {
      validated.push({
        rank: res.rank || index + 1,
        name: res.name || `${skillName} Learning Resource`,
        type: res.type || "Educational Resource",
        url,
        reason: res.reason || "Recommended for practical mastery",
      });
    }
  });

  // If AI generated fewer than 2 valid authoritative links, inject from our verified registry
  if (known) {
    Object.values(known).forEach((item) => {
      if (!validated.some((v) => v.url === item.url)) {
        validated.push({
          rank: validated.length + 1,
          name: item.name,
          type: item.type,
          url: item.url,
          reason: `Authoritative verified reference for ${skillName}.`,
        });
      }
    });
  } else if (validated.length === 0) {
    // General fallback to MDN or freeCodeCamp search
    validated.push({
      rank: 1,
      name: `MDN Web Docs Reference for ${skillName}`,
      type: "Official Reference",
      url: `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(skillName)}`,
      reason: `Authoritative developer reference for ${skillName}.`,
    });
    validated.push({
      rank: 2,
      name: `freeCodeCamp Guides: ${skillName}`,
      type: "Tutorial",
      url: `https://www.freecodecamp.org/news/search/?query=${encodeURIComponent(skillName)}`,
      reason: `Step-by-step practical guides and hands-on exercises for ${skillName}.`,
    });
  }

  return validated.slice(0, 3).map((item, idx) => ({ ...item, rank: idx + 1 }));
};

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
      overallAdvice: "Your demonstrated capabilities strongly align with this position. Prepare to speak to your hands-on project implementations during interviews.",
    };
  }

  const systemInstruction = `You are the SkillBridge Career & Learning Guide AI Agent.
Your mission is to provide an actionable, evidence-first learning roadmap for a candidate applying to: "${jobTitle}".
SkillBridge connects learning directly to proof: every learning step leads to a practical task, tangible evidence, and re-verification.

JOB TITLE: ${jobTitle}
REQUIRED SKILLS: ${requiredSkills.join(", ")}
ALREADY DEMONSTRATED SKILLS: ${demonstratedSkills.join(", ") || "None"}
GENUINE SKILL GAPS TO TARGET: ${skillsToTarget.join(", ")}

RULES:
1. FOCUS ONLY ON REAL SKILL GAPS:
   - Target only the skills in "${skillsToTarget.join(", ")}".
   - Do NOT teach skills the candidate has already demonstrated.
2. JOB-SPECIFIC RATIONALE:
   - Explain concretely WHY this skill is indispensable for "${jobTitle}".
3. SEQUENTIAL LEARNING PLAN:
   - Provide 3-4 realistic, progressive milestones (e.g. "Step 1: Master core concepts (2 hrs)", "Step 2: Build isolated test cases (3 hrs)").
4. CONCRETE PRACTICAL TASK & PROJECT IDEA:
   - Provide a specific hands-on task and a mini-project implementation idea.
5. TANGIBLE EVIDENCE TO PRODUCE:
   - List 2-3 specific artifacts the candidate should produce (e.g. "GitHub repository with clean commit history", "Working Dockerfile + docker-compose.yml", "Postman API collection with test scripts").
6. RE-VERIFICATION PROCESS:
   - Explain how SkillBridge will re-verify the candidate once evidence is uploaded (e.g. "Upload repository link to candidate projects to trigger automatic skill extraction and match re-computation").
7. VERIFIED RESOURCES:
   - Suggest reputable learning platforms (Official Docs, MDN, freeCodeCamp, Coursera, YouTube).
8. INDUSTRY CERTIFICATIONS:
   - Suggest 1 reputable industry certification ONLY if genuinely standard for this skill. Otherwise leave empty.

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
            currentStatus: { type: "STRING" },
            learningPlan: {
              type: "ARRAY",
              items: { type: "STRING" },
            },
            practicalTask: { type: "STRING" },
            projectIdea: { type: "STRING" },
            evidenceToProduce: {
              type: "ARRAY",
              items: { type: "STRING" },
            },
            verificationStep: { type: "STRING" },
            resources: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  rank: { type: "INTEGER" },
                  name: { type: "STRING" },
                  type: { type: "STRING" },
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
            "learningPlan",
            "practicalTask",
            "projectIdea",
            "evidenceToProduce",
            "verificationStep",
            "resources",
          ],
        },
      },
      overallAdvice: { type: "STRING" },
    },
    required: ["skillsToImprove"],
  };

  const result = await callLLM({
    systemInstruction,
    userContent: `Generate the personalized SkillBridge evidence-first learning roadmap for role: ${jobTitle}`,
    responseSchema,
    temperature: 0.2,
  });

  const skillsToImprove = (result.skillsToImprove || []).map((item) => {
    const validatedResources = validateAndGroundResources(item.skill, item.resources);
    return {
      skill: item.skill,
      whyItMatters: item.whyItMatters || `Required core capability for ${jobTitle}.`,
      currentStatus: item.currentStatus || "No supporting candidate evidence recorded.",
      learningPlan: item.learningPlan || [],
      roadmap: item.learningPlan || [], // backward compatibility
      practicalTask: item.practicalTask || `Implement a hands-on module utilizing ${item.skill}.`,
      projectIdea: item.projectIdea || `Build a practical demo showcasing ${item.skill} integrated with standard workflows.`,
      evidenceToProduce: item.evidenceToProduce || [`GitHub repository showcasing ${item.skill} implementation`, "README with architecture overview"],
      verificationStep: item.verificationStep || "Add project to your SkillBridge profile to automatically update match scoring.",
      resources: validatedResources,
      certifications: item.certifications || [],
    };
  });

  return {
    allSkillsDemonstrated: skillsToImprove.length === 0,
    skillsToImprove,
    overallAdvice:
      result.overallAdvice ||
      "Focus on implementing practical projects that yield concrete code evidence to maximize your verified SkillBridge score.",
  };
};
