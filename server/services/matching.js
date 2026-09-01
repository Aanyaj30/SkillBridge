import { isSkillMatch, normalizeSkill, normalizeSkillList } from "./matching/skillNormalizer.js";

/**
 * Deterministic Scoring Engine for SkillBridge
 * Strictly follows truthfulness: no invented scores, no fabricated skills.
 */

// Helper to calculate total months of formal experience
const calculateTotalExperienceMonths = (workHistory = []) => {
  if (!workHistory || !Array.isArray(workHistory) || workHistory.length === 0) return 0;
  let totalMonths = 0;

  for (const job of workHistory) {
    if (job.startDate) {
      const start = new Date(job.startDate);
      const end = job.endDate ? new Date(job.endDate) : new Date();
      const diff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      if (diff > 0) totalMonths += diff;
    }
  }

  return totalMonths;
};

/**
 * Traditional ATS / Resume Baseline Score
 * Evaluates conventional screening factors:
 * - Role title match (30%)
 * - Experience duration & gap penalty (25%)
 * - Education relevance (20%)
 * - Direct resume keyword presence (25%)
 */
export const computeTraditionalATSScore = (candidate, job) => {
  let score = 0;
  const jobTitle = (job.title || "").toLowerCase();
  const rawResume = (candidate.resumeText || "").toLowerCase();
  const workHistory = candidate.workHistory || [];

  // 1. Role Title Alignment (0 to 30 points)
  let titleMatch = false;
  for (const wh of workHistory) {
    const pastTitle = (wh.title || "").toLowerCase();
    if (
      (jobTitle.includes("frontend") && pastTitle.includes("frontend")) ||
      (jobTitle.includes("backend") && pastTitle.includes("backend")) ||
      (jobTitle.includes("full stack") && (pastTitle.includes("full stack") || pastTitle.includes("developer"))) ||
      (jobTitle.includes("software") && pastTitle.includes("software")) ||
      (jobTitle.includes("manager") && pastTitle.includes("manager")) ||
      (pastTitle && jobTitle.includes(pastTitle))
    ) {
      titleMatch = true;
      break;
    }
  }
  if (titleMatch) {
    score += 30;
  } else if (workHistory.length > 0) {
    score += 10; // partial for having any work history
  }

  // 2. Experience Duration & Career Continuity (0 to 25 points)
  const expMonths = calculateTotalExperienceMonths(workHistory);
  if (expMonths >= 36 && !candidate.hasCareerGap) {
    score += 25;
  } else if (expMonths >= 24) {
    score += candidate.hasCareerGap ? 12 : 20;
  } else if (expMonths >= 6) {
    score += candidate.hasCareerGap ? 8 : 15;
  } else if (expMonths > 0) {
    score += 5;
  }

  // 3. Education Factor (0 to 20 points)
  const education = candidate.education || [];
  const hasCSDegree =
    rawResume.includes("computer science") ||
    rawResume.includes("b.tech") ||
    rawResume.includes("information technology") ||
    rawResume.includes("engineering") ||
    rawResume.includes("bachelor") ||
    rawResume.includes("master") ||
    education.length > 0;

  if (hasCSDegree) {
    score += 20;
  } else if (rawResume.includes("degree") || rawResume.includes("diploma")) {
    score += 10;
  }

  // 4. Direct Resume Keyword Match (0 to 25 points)
  const requiredSkills = normalizeSkillList(job.requiredSkills || []);
  if (requiredSkills.length > 0) {
    let resumeKeywordHits = 0;
    requiredSkills.forEach((reqSkill) => {
      const lower = reqSkill.toLowerCase();
      if (rawResume.includes(lower)) {
        resumeKeywordHits += 1;
      }
    });
    const keywordRatio = resumeKeywordHits / requiredSkills.length;
    score += Math.round(keywordRatio * 25);
  } else {
    score += 15;
  }

  return Math.min(100, Math.max(0, Math.round(score)));
};

/**
 * SkillBridge Demonstrated Match Score
 * Purely evaluates verified skills against required job skills:
 * - Verified Skill Coverage (up to 80%)
 * - Practical Project Depth (up to 12%)
 * - Adaptive Interview Demonstration (up to 8%)
 */
export const computeMatch = (candidate, job, interviewAnswers = []) => {
  const requiredSkills = normalizeSkillList(job.requiredSkills || []);
  const importantSkills = normalizeSkillList(job.importantSkills || []);

  // Collect candidate verified skill evidence
  const allCandidateEvidence = candidate.skillEvidence || [];
  const candidateProjects = candidate.projects || [];
  const candidateCerts = candidate.certificates || [];

  // Build candidate skills list
  const candidateSkillNames = [];
  allCandidateEvidence.forEach((item) => {
    if (item.skill) candidateSkillNames.push(item.skill);
  });
  candidateProjects.forEach((p) => {
    (p.technologies || []).forEach((t) => candidateSkillNames.push(t));
  });
  candidateCerts.forEach((c) => {
    (c.skills || []).forEach((s) => candidateSkillNames.push(s));
  });
  interviewAnswers.forEach((ia) => {
    if (ia.targetSkill) candidateSkillNames.push(ia.targetSkill);
    (ia.skills || []).forEach((s) => candidateSkillNames.push(s.name || s.skill || ""));
  });

  // 1. Identify Matched and Missing Skills
  const matchedSkills = [];
  const skillsNeedingRefresh = [];
  const relevantEvidence = [];

  requiredSkills.forEach((reqSkill) => {
    // Find matching candidate skill
    const isMatched = candidateSkillNames.some((candSkill) =>
      isSkillMatch(candSkill, reqSkill)
    );

    if (isMatched) {
      matchedSkills.push(reqSkill);

      // Find best evidence snippet
      const evItem = allCandidateEvidence.find((e) => isSkillMatch(e.skill, reqSkill));
      if (evItem) {
        relevantEvidence.push(evItem);
      } else {
        // Project or interview evidence
        const projItem = candidateProjects.find((p) =>
          (p.technologies || []).some((t) => isSkillMatch(t, reqSkill))
        );
        if (projItem) {
          relevantEvidence.push({
            skill: reqSkill,
            evidence: `Demonstrated in project "${projItem.title}": ${projItem.description?.slice(0, 100)}...`,
            source: "project",
            strength: "High",
            confidence: 0.9,
          });
        } else {
          relevantEvidence.push({
            skill: reqSkill,
            evidence: "Verified via candidate skill profile",
            source: "resume",
            strength: "Medium",
            confidence: 0.85,
          });
        }
      }
    } else {
      skillsNeedingRefresh.push(reqSkill);
    }
  });

  // 2. SkillBridge Score Calculation
  let skillMatchScore = 0;
  if (requiredSkills.length > 0) {
    const coverageRatio = matchedSkills.length / requiredSkills.length;
    skillMatchScore += coverageRatio * 80; // 80 points max for required skills coverage
  } else {
    skillMatchScore += 80;
  }

  // Practical Project Depth Bonus (up to 12 points)
  if (candidateProjects.length >= 2) {
    skillMatchScore += 12;
  } else if (candidateProjects.length === 1) {
    skillMatchScore += 8;
  }

  // Interview Demonstration Bonus (up to 8 points)
  if (interviewAnswers && interviewAnswers.length > 0) {
    skillMatchScore += 8;
  }

  // Cap at 100
  const finalMatchScore = Math.min(100, Math.max(0, Math.round(skillMatchScore)));

  // 3. Traditional ATS Score
  const baselineMatchScore = computeTraditionalATSScore(candidate, job);

  // 4. Improvement & Overlooked Flag
  const improvement = Math.max(0, finalMatchScore - baselineMatchScore);
  const potentiallyOverlooked =
    (improvement >= 20 && finalMatchScore >= 70) ||
    (baselineMatchScore <= 50 && finalMatchScore >= 75);

  return {
    baselineMatchScore,
    matchScore: finalMatchScore,
    improvement,
    matchedSkills,
    skillsNeedingRefresh,
    skillEvidence: relevantEvidence,
    potentiallyOverlooked,
  };
};
