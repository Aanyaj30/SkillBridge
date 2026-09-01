import assert from "node:assert";
import {
  extractExplicitSkillsFromResume,
  isSkillExplicitlyPresent,
  findSkillEvidence,
  normalizeSkill,
  isSkillMatch,
} from "../services/matching/skillNormalizer.js";
import { parseResumeLocally } from "../services/resume/edenParser.js";

console.log("==================================================");
console.log("RUNNING DETERMINISTIC SKILL EXTRACTION TEST SUITE");
console.log("==================================================\n");

let passedCount = 0;
let totalCount = 0;

function test(name, fn) {
  totalCount++;
  try {
    fn();
    console.log(`✅ [PASS] ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`❌ [FAIL] ${name}`);
    console.error(err);
  }
}

// ---------------------------------------------------------
// TEST CASE 1: Explicit Skill Listing
// ---------------------------------------------------------
test("Test Case 1: 'Skills: Java, Python, React, MongoDB'", () => {
  const resume = "Skills: Java, Python, React, MongoDB";
  const skills = extractExplicitSkillsFromResume(resume);

  const extractedNames = skills.map((s) => s.skill).sort();
  const expectedNames = ["Java", "MongoDB", "Python", "React"].sort();

  assert.deepStrictEqual(extractedNames, expectedNames, `Expected ${expectedNames} but got ${extractedNames}`);
  
  // Verify evidence
  for (const s of skills) {
    assert.strictEqual(s.evidence, "Skills: Java, Python, React, MongoDB");
    assert.strictEqual(s.source, "resume");
  }

  // Verify that hallucinated skills do not exist
  assert.strictEqual(isSkillExplicitlyPresent("AWS", resume), false);
  assert.strictEqual(isSkillExplicitlyPresent("Docker", resume), false);
  assert.strictEqual(isSkillExplicitlyPresent("Kubernetes", resume), false);
});

// ---------------------------------------------------------
// TEST CASE 2: No Inferred Skills from Job Titles
// ---------------------------------------------------------
test("Test Case 2: 'Software Engineer Intern at XYZ Company' produces no hallucinated skills", () => {
  const resume = "Software Engineer Intern at XYZ Company";
  const skills = extractExplicitSkillsFromResume(resume);

  assert.strictEqual(skills.length, 0, `Expected 0 skills but got ${skills.map((s) => s.skill).join(", ")}`);
  assert.strictEqual(isSkillExplicitlyPresent("Java", resume), false);
  assert.strictEqual(isSkillExplicitlyPresent("Python", resume), false);
  assert.strictEqual(isSkillExplicitlyPresent("AWS", resume), false);
  assert.strictEqual(isSkillExplicitlyPresent("Docker", resume), false);
  assert.strictEqual(isSkillExplicitlyPresent("Kubernetes", resume), false);
});

// ---------------------------------------------------------
// TEST CASE 3: Action-Sentence with Normalized Aliases
// ---------------------------------------------------------
test("Test Case 3: 'Built a video conferencing application using ReactJS, Node.js, Socket.io and WebRTC.'", () => {
  const resume = "Built a video conferencing application using ReactJS, Node.js, Socket.io and WebRTC.";
  const skills = extractExplicitSkillsFromResume(resume);

  const extractedNames = skills.map((s) => s.skill).sort();
  const expectedNames = ["Node.js", "React", "WebRTC", "WebSockets"].sort();

  assert.deepStrictEqual(extractedNames, expectedNames, `Expected ${expectedNames} but got ${extractedNames}`);

  // Check evidence and strength
  for (const s of skills) {
    assert.strictEqual(s.strength, "High", `Expected High strength for ${s.skill}`);
    assert.strictEqual(s.confidence, 0.98);
    assert.ok(s.evidence.includes("ReactJS") || s.evidence.includes("Node.js"));
  }
});

// ---------------------------------------------------------
// FALSE POSITIVE & BOUNDARY GUARD TESTS
// ---------------------------------------------------------
test("False Positive: 'Java' must NOT match 'JavaScript'", () => {
  const resume = "Experienced in JavaScript, TypeScript, and JSON.";
  const skills = extractExplicitSkillsFromResume(resume);

  const names = skills.map((s) => s.skill);
  assert.ok(names.includes("JavaScript"), "Should include JavaScript");
  assert.ok(names.includes("TypeScript"), "Should include TypeScript");
  assert.ok(!names.includes("Java"), "Should NEVER include Java when only JavaScript is present");
  assert.strictEqual(isSkillExplicitlyPresent("Java", resume), false);
});

test("False Positive: Conversational 'go' must NOT match programming language 'Go'", () => {
  const resume = "I like to go through requirements, let's go over ongoing goals and good results.";
  const skills = extractExplicitSkillsFromResume(resume);

  assert.strictEqual(skills.length, 0, `Expected 0 skills but got: ${skills.map((s) => s.skill).join(", ")}`);
  assert.strictEqual(isSkillExplicitlyPresent("Go", resume), false);
});

test("True Positive: 'Go' and 'Golang' in technical context match correctly", () => {
  const resume1 = "Skills: Python, Go, Java";
  const skills1 = extractExplicitSkillsFromResume(resume1);
  assert.ok(skills1.map((s) => s.skill).includes("Go"), "Should extract Go in technical skills list");

  const resume2 = "Developed high-concurrency microservices in Golang.";
  const skills2 = extractExplicitSkillsFromResume(resume2);
  assert.ok(skills2.map((s) => s.skill).includes("Go"), "Should extract Go when Golang is mentioned");
});

test("False Positive: Single letter 'C' must NOT match words containing letter C", () => {
  const resume = "Senior Director at California Company C with client coordination.";
  assert.strictEqual(isSkillExplicitlyPresent("C", resume), false);
});

test("True Positive: 'C' in language lists or 'C programming' matches correctly", () => {
  const resume1 = "Languages: C, C++, Python";
  assert.strictEqual(isSkillExplicitlyPresent("C", resume1), true);
  assert.strictEqual(isSkillExplicitlyPresent("C++", resume1), true);

  const resume2 = "Built embedded firmware using C programming and Assembly.";
  assert.strictEqual(isSkillExplicitlyPresent("C", resume2), true);
});

test("Special Symbols: 'C++' and 'C#' boundary check without regex failure", () => {
  const resume = "Developed robust backend engines using C++ and C# .NET Core.";
  const skills = extractExplicitSkillsFromResume(resume);
  const names = skills.map((s) => s.skill);

  assert.ok(names.includes("C++"), "Should extract C++");
  assert.ok(names.includes("C#"), "Should extract C#");
  assert.ok(names.includes("ASP.NET"), "Should extract ASP.NET from .NET Core");
});

test("Alias Normalization: 'React', 'ReactJS', 'React.js' all normalize to 'React'", () => {
  assert.strictEqual(normalizeSkill("React"), "React");
  assert.strictEqual(normalizeSkill("reactjs"), "React");
  assert.strictEqual(normalizeSkill("react.js"), "React");
  assert.strictEqual(normalizeSkill("React JS"), "React");

  assert.strictEqual(normalizeSkill("node.js"), "Node.js");
  assert.strictEqual(normalizeSkill("nodejs"), "Node.js");
  assert.strictEqual(normalizeSkill("node js"), "Node.js");
});

test("SAP Technologies Recognition", () => {
  const resume = "Experienced in SAP HANA database modeling, SAP BTP integrations, and SAP Fiori UI developments with ABAP.";
  const skills = extractExplicitSkillsFromResume(resume);
  const names = skills.map((s) => s.skill);

  assert.ok(names.includes("SAP HANA"), "Should extract SAP HANA");
  assert.ok(names.includes("SAP BTP"), "Should extract SAP BTP");
  assert.ok(names.includes("SAP Fiori"), "Should extract SAP Fiori");
  assert.ok(names.includes("SAP ABAP"), "Should extract SAP ABAP");
});

test("Filtering Eden AI Hallucinated Skills Simulation", () => {
  const rawResumeText = "Candidate summary:\nExperienced Java and MySQL developer with Agile scrum experience.";
  const simulatedEdenAISkills = [
    { name: "Java" },
    { name: "MySQL" },
    { name: "AWS" }, // Inferred/Hallucinated by Eden AI
    { name: "Docker" }, // Inferred/Hallucinated by Eden AI
    { name: "Kubernetes" }, // Inferred/Hallucinated by Eden AI
    { name: "Agile / Scrum" },
  ];

  // Apply our validation filter
  const validated = simulatedEdenAISkills.filter((s) =>
    isSkillExplicitlyPresent(s.name, rawResumeText)
  );

  const validatedNames = validated.map((s) => normalizeSkill(s.name)).sort();
  const expectedNames = ["Agile / Scrum", "Java", "MySQL"].sort();

  assert.deepStrictEqual(validatedNames, expectedNames);
});

// ---------------------------------------------------------
// LOCAL STRUCTURED PARSER TEST
// ---------------------------------------------------------
test("Local Parser: parseResumeLocally extracts full profile and verified skills", () => {
  const sampleResume = `
John Doe
john.doe@example.com | (555) 123-4567

Education
Bachelor of Science in Computer Science, State University, 2023

Skills
Technical Skills: React, Node.js, Express, PostgreSQL, Docker, Git

Experience
Full Stack Developer at Tech Corp
- Built scalable web applications using React and Node.js
- Implemented PostgreSQL database schemas and REST APIs
`;

  const parsed = parseResumeLocally(sampleResume);

  assert.strictEqual(parsed.name, "John Doe");
  assert.strictEqual(parsed.email, "john.doe@example.com");
  assert.strictEqual(parsed.phone, "(555) 123-4567");
  assert.ok(parsed.education.length > 0);

  const skillNames = parsed.skills.map((s) => s.skill);
  assert.ok(skillNames.includes("React"));
  assert.ok(skillNames.includes("Node.js"));
  assert.ok(skillNames.includes("Express"));
  assert.ok(skillNames.includes("PostgreSQL"));
  assert.ok(skillNames.includes("Docker"));
  assert.ok(skillNames.includes("Git"));
  assert.ok(skillNames.includes("REST APIs"));

  // Check that every extracted skill has real evidence snippet
  for (const s of parsed.skills) {
    assert.ok(s.evidence && s.evidence.length > 0);
    assert.ok(sampleResume.includes(s.evidence) || sampleResume.toLowerCase().includes(s.skill.toLowerCase()));
  }
});

console.log("\n==================================================");
console.log(`TEST RESULTS: ${passedCount} / ${totalCount} PASSED`);
console.log("==================================================");

if (passedCount === totalCount) {
  process.exit(0);
} else {
  process.exit(1);
}
