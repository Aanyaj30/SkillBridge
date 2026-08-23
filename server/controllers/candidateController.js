import Candidate from "../models/Candidate.js";

// Simple month-difference calculator — no extra library needed.
const monthsBetween = (start, end) => {
  return (
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth())
  );
};

// Looks at a candidate's work history and finds the largest gap between
// consecutive jobs. If that gap is 6+ months, we flag it as a career gap —
// this is what decides whether the skill interview gets triggered.
const detectGap = (workHistory) => {
  if (!workHistory || workHistory.length < 2) {
    return { hasCareerGap: false, gapDurationMonths: 0 };
  }

  const sorted = [...workHistory].sort(
    (a, b) => new Date(a.startDate) - new Date(b.startDate),
  );

  let maxGap = 0;
  for (let i = 0; i < sorted.length - 1; i++) {
    const currentEnd = sorted[i].endDate
      ? new Date(sorted[i].endDate)
      : new Date();
    const nextStart = new Date(sorted[i + 1].startDate);
    const gap = monthsBetween(currentEnd, nextStart);
    if (gap > maxGap) maxGap = gap;
  }

  return {
    hasCareerGap: maxGap >= 6,
    gapDurationMonths: maxGap > 0 ? maxGap : 0,
  };
};

// GET /api/candidate/profile — fetch the logged-in candidate's own data
export const getProfile = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.user.id).select("-password");
    if (!candidate)
      return res.status(404).json({ message: "Candidate not found" });
    res.json(candidate);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/candidate/work-history — save work history, auto-detect gap
export const updateWorkHistory = async (req, res) => {
  try {
    const { workHistory } = req.body;

    const { hasCareerGap, gapDurationMonths } = detectGap(workHistory);

    const candidate = await Candidate.findByIdAndUpdate(
      req.user.id,
      { workHistory, hasCareerGap, gapDurationMonths },
      { new: true },
    ).select("-password");

    res.json(candidate);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/candidate/interview-answers — save the skill interview Q&A
export const saveInterviewAnswers = async (req, res) => {
  try {
    const { answers } = req.body; // array of { question, answer }

    const candidate = await Candidate.findByIdAndUpdate(
      req.user.id,
      { breakInterviewAnswers: answers },
      { new: true },
    ).select("-password");

    res.json(candidate);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
