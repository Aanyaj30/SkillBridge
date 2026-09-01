// Canonical Skill Dictionary and Aliases Map
const SKILL_ALIASES = {
  // Frontend & UI
  "react": "React",
  "reactjs": "React",
  "react.js": "React",
  "react native": "React Native",
  "react-native": "React Native",
  "nextjs": "Next.js",
  "next.js": "Next.js",
  "vue": "Vue.js",
  "vuejs": "Vue.js",
  "vue.js": "Vue.js",
  "angular": "Angular",
  "angularjs": "Angular",
  "angular.js": "Angular",
  "svelte": "Svelte",
  "html": "HTML",
  "html5": "HTML",
  "css": "CSS",
  "css3": "CSS",
  "tailwind": "Tailwind CSS",
  "tailwindcss": "Tailwind CSS",
  "tailwind css": "Tailwind CSS",
  "bootstrap": "Bootstrap",
  "sass": "Sass",
  "scss": "Sass",
  "redux": "Redux",
  "redux toolkit": "Redux",
  "rtk": "Redux",
  "context api": "State Management",
  "state management": "State Management",

  // Languages
  "javascript": "JavaScript",
  "js": "JavaScript",
  "es6": "JavaScript",
  "typescript": "TypeScript",
  "ts": "TypeScript",
  "python": "Python",
  "py": "Python",
  "java": "Java",
  "c++": "C++",
  "cpp": "C++",
  "c#": "C#",
  "csharp": "C#",
  "golang": "Go",
  "go": "Go",
  "rust": "Rust",
  "php": "PHP",
  "ruby": "Ruby",
  "sql": "SQL",

  // Backend & APIs
  "node": "Node.js",
  "nodejs": "Node.js",
  "node.js": "Node.js",
  "node js": "Node.js",
  "express": "Express",
  "expressjs": "Express",
  "express.js": "Express",
  "express js": "Express",
  "rest api": "REST APIs",
  "rest apis": "REST APIs",
  "restful api": "REST APIs",
  "restful apis": "REST APIs",
  "rest": "REST APIs",
  "restful": "REST APIs",
  "api integration": "REST APIs",
  "api design": "REST APIs",
  "graphql": "GraphQL",
  "apollo": "GraphQL",
  "fastapi": "FastAPI",
  "django": "Django",
  "flask": "Flask",
  "spring": "Spring Boot",
  "spring boot": "Spring Boot",
  "springboot": "Spring Boot",
  "microservices": "Microservices",
  "websockets": "WebSockets",
  "socket.io": "WebSockets",

  // Databases
  "mongodb": "MongoDB",
  "mongo db": "MongoDB",
  "mongo": "MongoDB",
  "mongoose": "MongoDB",
  "postgresql": "PostgreSQL",
  "postgres": "PostgreSQL",
  "psql": "PostgreSQL",
  "mysql": "MySQL",
  "redis": "Redis",
  "sqlite": "SQLite",
  "dynamodb": "DynamoDB",
  "firebase": "Firebase",
  "firestore": "Firestore",
  "prisma": "Prisma ORM",

  // DevOps & Cloud
  "docker": "Docker",
  "containerization": "Docker",
  "kubernetes": "Kubernetes",
  "k8s": "Kubernetes",
  "aws": "AWS",
  "amazon web services": "AWS",
  "azure": "Azure",
  "gcp": "Google Cloud",
  "google cloud": "Google Cloud",
  "ci/cd": "CI/CD",
  "github actions": "CI/CD",
  "jenkins": "Jenkins",
  "git": "Git",
  "github": "Git",
  "gitlab": "Git",
  "linux": "Linux",

  // Testing & Quality
  "jest": "Jest",
  "mocha": "Testing",
  "cypress": "Cypress",
  "unit testing": "Unit Testing",
  "testing": "Testing",

  // Management & Functional
  "project planning": "Project Planning",
  "project management": "Project Management",
  "stakeholder management": "Stakeholder Management",
  "budget management": "Budget Management",
  "budgeting": "Budget Management",
  "risk management": "Risk Management",
  "team coordination": "Team Coordination",
  "team leadership": "Team Leadership",
  "leadership": "Team Leadership",
  "agile": "Agile / Scrum",
  "scrum": "Agile / Scrum",
  "communication": "Communication",
  "time management": "Time Management",
  "scheduling": "Time Management",
  "problem solving": "Problem Solving",
};

/**
 * Normalizes a raw skill string into its canonical representation.
 * If no alias matches, cleans up whitespace and returns title case.
 */
export const normalizeSkill = (rawSkill = "") => {
  if (!rawSkill || typeof rawSkill !== "string") return "";
  const cleaned = rawSkill.trim().toLowerCase().replace(/['"]/g, "");
  
  if (SKILL_ALIASES[cleaned]) {
    return SKILL_ALIASES[cleaned];
  }

  // Remove common trailing words like "framework", "library", "technology"
  const stripped = cleaned
    .replace(/\s+(framework|library|technologies|technology|skills|skill|development|developer)$/i, "")
    .trim();

  if (SKILL_ALIASES[stripped]) {
    return SKILL_ALIASES[stripped];
  }

  // Title-case fallback
  return rawSkill
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

/**
 * Checks if candidate skill matches required job skill.
 * Strictly verifies identity or canonical alias without hallucinating relationships!
 */
export const isSkillMatch = (candidateSkill, requiredSkill) => {
  if (!candidateSkill || !requiredSkill) return false;

  const normCandidate = normalizeSkill(candidateSkill).toLowerCase();
  const normRequired = normalizeSkill(requiredSkill).toLowerCase();

  if (normCandidate === normRequired) return true;

  // Substring check only if word boundary matches (e.g. "REST APIs" vs "RESTful APIs")
  const rawCand = candidateSkill.toLowerCase().trim();
  const rawReq = requiredSkill.toLowerCase().trim();

  if (rawCand === rawReq) return true;

  if (
    (rawCand.includes("rest") && rawReq.includes("rest")) &&
    (rawCand.includes("api") && rawReq.includes("api"))
  ) {
    return true;
  }

  if (
    (rawCand.includes("node") && rawReq.includes("node")) ||
    (rawCand.includes("react") && rawReq.includes("react") && !rawCand.includes("native") && !rawReq.includes("native")) ||
    (rawCand.includes("mongo") && rawReq.includes("mongo")) ||
    (rawCand.includes("express") && rawReq.includes("express")) ||
    (rawCand.includes("postgre") && rawReq.includes("postgre")) ||
    (rawCand.includes("tailwind") && rawReq.includes("tailwind")) ||
    (rawCand.includes("typescript") && rawReq.includes("typescript")) ||
    (rawCand.includes("javascript") && rawReq.includes("javascript"))
  ) {
    return true;
  }

  return false;
};

/**
 * Normalizes an array of skills, filtering duplicates.
 */
export const normalizeSkillList = (skills = []) => {
  const seen = new Set();
  const result = [];

  for (const s of skills) {
    if (!s) continue;
    const name = typeof s === "string" ? s : s.skill || s.name || "";
    const norm = normalizeSkill(name);
    const key = norm.toLowerCase();
    if (norm && !seen.has(key)) {
      seen.add(key);
      result.push(norm);
    }
  }

  return result;
};
