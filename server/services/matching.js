// This file computes both scores your before/after reveal depends on.
// Both use the EXACT SAME comparison method (skill overlap ÷ required
// skills) — the only difference is which skills are fed in. That's the
// honest, defensible core of the product's whole story.

const normalize = (str) => str.toLowerCase().trim();

const isMatch = (a, b) => {
  const na = normalize(a);
  const nb = normalize(b);
  return na === nb || na.includes(nb) || nb.includes(na);
};

// A traditional ATS mostly sees job titles/keywords — nothing about what
// happened during a career break. We simulate that limited visibility by
// pulling keywords only from formal work history titles.
const extractTitleKeywords = (workHistory = []) => {
  return workHistory
    .flatMap((job) => job.title.split(/\s+/))
    .filter((word) => word.length > 3); // skip short filler words
};

const scoreAgainst = (requiredSkills, candidateSkills) => {
  const matched = requiredSkills.filter((req) =>
    candidateSkills.some((cs) => isMatch(cs, req)),
  );
  const score = requiredSkills.length
    ? Math.round((matched.length / requiredSkills.length) * 100)
    : 0;
  return {
    score,
    matched,
    missing: requiredSkills.filter((r) => !matched.includes(r)),
  };
};

export const computeMatch = (candidate, job) => {
  const titleKeywords = extractTitleKeywords(candidate.workHistory);
  const extractedNames = (candidate.extractedSkills || []).map((s) => s.name);

  // BASELINE — what a traditional ATS would see: only formal titles,
  // nothing about the career break. This is your "before."
  const baseline = scoreAgainst(job.requiredSkills, titleKeywords);

  // REAL SCORE — formal titles PLUS the skills extracted from the break
  // interview. This is your "after."
  const fullSkills = [...titleKeywords, ...extractedNames];
  const real = scoreAgainst(job.requiredSkills, fullSkills);

  return {
    baselineMatchScore: baseline.score,
    matchScore: real.score,
    matchedSkills: real.matched,
    skillsNeedingRefresh: real.missing,
  };
};
