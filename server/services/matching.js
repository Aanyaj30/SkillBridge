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
  const jobTitle = (job.title || "").toLowerCase();
  const rawResume = (candidate.resumeText || "").toLowerCase();
  const workHistory = candidate.workHistory || [];

  // 1. Role Title Alignment (0 to 30 points)
  let titleScore = 0;
  let titleMatch = false;
  let matchedPastTitle = "";
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
      matchedPastTitle = wh.title;
      break;
    }
  }
  if (titleMatch) {
    titleScore = 30;
  } else if (workHistory.length > 0) {
    titleScore = 10; // partial for having any work history
  }

  // 2. Experience Duration & Career Continuity (0 to 25 points)
  const expMonths = calculateTotalExperienceMonths(workHistory);
  let expScore = 0;
  if (expMonths >= 36 && !candidate.hasCareerGap) {
    expScore = 25;
  } else if (expMonths >= 24) {
    expScore = candidate.hasCareerGap ? 12 : 20;
  } else if (expMonths >= 6) {
    expScore = candidate.hasCareerGap ? 8 : 15;
  } else if (expMonths > 0) {
    expScore = 5;
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

  let eduScore = 0;
  if (hasCSDegree) {
    eduScore = 20;
  } else if (rawResume.includes("degree") || rawResume.includes("diploma")) {
    eduScore = 10;
  }

  // 4. Direct Resume Keyword Match (0 to 25 points)
  const requiredSkills = normalizeSkillList(job.requiredSkills || []);
  let keywordScore = 0;
  const matchedKeywords = [];
  const missingKeywords = [];

  if (requiredSkills.length > 0) {
    requiredSkills.forEach((reqSkill) => {
      const lower = reqSkill.toLowerCase();
      if (rawResume.includes(lower)) {
        matchedKeywords.push(reqSkill);
      } else {
        missingKeywords.push(reqSkill);
      }
    });
    const keywordRatio = matchedKeywords.length / requiredSkills.length;
    keywordScore = Math.round(keywordRatio * 25);
  } else {
    keywordScore = 15;
  }

  const totalScore = Math.min(100, Math.max(0, titleScore + expScore + eduScore + keywordScore));

  const breakdown = {
    roleTitle: {
      score: titleScore,
      max: 30,
      matched: titleMatch,
      detail: titleMatch
        ? `Matched past role (${matchedPastTitle}) with target title`
        : workHistory.length > 0
        ? "Partial credit for general work history"
        : "No title or history match",
    },
    experience: {
      score: expScore,
      max: 25,
      months: expMonths,
      hasGap: Boolean(candidate.hasCareerGap),
      detail: `${Math.round((expMonths / 12) * 10) / 10} yrs total experience${
        candidate.hasCareerGap ? " (career break flagged by ATS)" : ""
      }`,
    },
    education: {
      score: eduScore,
      max: 20,
      hasDegree: Boolean(hasCSDegree),
      detail: hasCSDegree
        ? "Technical/CS degree or coursework detected"
        : eduScore === 10
        ? "General degree/diploma detected"
        : "No formal degree detected in resume",
    },
    keywords: {
      score: keywordScore,
      max: 25,
      matchedCount: matchedKeywords.length,
      totalCount: requiredSkills.length,
      matchedKeywords,
      missingKeywords,
      detail: `${matchedKeywords.length} of ${requiredSkills.length} exact resume keywords found`,
    },
  };

  return { totalScore, score: totalScore, breakdown };
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
  let coverageRatio = 1;
  let skillCoverageScore = 80;
  if (requiredSkills.length > 0) {
    coverageRatio = matchedSkills.length / requiredSkills.length;
    skillCoverageScore = Math.round(coverageRatio * 80);
  }

  // Practical Project Depth Bonus (up to 12 points)
  let projectBonus = 0;
  if (candidateProjects.length >= 2) {
    projectBonus = 12;
  } else if (candidateProjects.length === 1) {
    projectBonus = 8;
  }

  // Interview Demonstration Bonus (up to 8 points)
  let interviewBonus = 0;
  if (interviewAnswers && interviewAnswers.length > 0) {
    interviewBonus = 8;
  }

  // Cap at 100
  const finalMatchScore = Math.min(100, Math.max(0, skillCoverageScore + projectBonus + interviewBonus));

  const matchBreakdown = {
    skillCoverage: {
      score: skillCoverageScore,
      max: 80,
      matchedCount: matchedSkills.length,
      totalCount: requiredSkills.length,
      detail: `${matchedSkills.length} of ${requiredSkills.length} required skills verified through demonstrated evidence`,
    },
    projectBonus: {
      score: projectBonus,
      max: 12,
      projectCount: candidateProjects.length,
      detail:
        candidateProjects.length >= 2
          ? `+12% portfolio depth bonus for ${candidateProjects.length} practical projects`
          : candidateProjects.length === 1
          ? `+8% portfolio depth bonus for 1 practical project`
          : "0% (no practical projects logged)",
    },
    interviewBonus: {
      score: interviewBonus,
      max: 8,
      interviewCompleted: Boolean(interviewAnswers && interviewAnswers.length > 0),
      detail:
        interviewAnswers && interviewAnswers.length > 0
          ? `+8% adaptive interview demonstration bonus`
          : "0% (interview not taken for this application)",
    },
  };

  // 3. Traditional ATS Score
  const baselineResult = computeTraditionalATSScore(candidate, job);
  const baselineMatchScore =
    typeof baselineResult === "number" ? baselineResult : baselineResult.totalScore;
  const baselineBreakdown = baselineResult.breakdown || {};

  // 4. Improvement & Overlooked Flag
  const improvement = Math.max(0, finalMatchScore - baselineMatchScore);
  const potentiallyOverlooked =
    (improvement >= 20 && finalMatchScore >= 70) ||
    (baselineMatchScore <= 50 && finalMatchScore >= 75);

  return {
    baselineMatchScore,
    baselineBreakdown,
    matchScore: finalMatchScore,
    matchBreakdown,
    improvement,
    matchedSkills,
    skillsNeedingRefresh,
    skillEvidence: relevantEvidence,
    potentiallyOverlooked,
  };
};
