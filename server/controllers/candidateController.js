import Candidate from "../models/Candidate.js";
import { extractSkillsFromInterview } from "../services/aiService.js";

// Simple month-difference calculator — no extra library needed.
const monthsBetween = (start, end) => {
  return (
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth())
  );
};

// Finds EVERY gap in the candidate's work history — not just the current
// one. Historical gaps (between two past jobs) are stored for context but
// never marked isCurrent, so they never trigger the interview or affect
// matching. Only a gap after the most recent job (if it's ended and
// nothing newer has started) counts as "current."
const analyzeGaps = (workHistory) => {
  if (!workHistory || workHistory.length === 0) {
    return { careerGaps: [], hasCareerGap: false, gapDurationMonths: 0 };
  }

  const sorted = [...workHistory].sort(
    (a, b) => new Date(a.startDate) - new Date(b.startDate),
  );

  const careerGaps = [];

  // Historical gaps: between each consecutive pair of past jobs
  for (let i = 0; i < sorted.length - 1; i++) {
    if (!sorted[i].endDate) continue; // no end date means overlapping/ongoing — not a real gap
    const gapStart = new Date(sorted[i].endDate);
    const gapEnd = new Date(sorted[i + 1].startDate);
    const duration = monthsBetween(gapStart, gapEnd);
    if (duration > 0) {
      careerGaps.push({
        startDate: gapStart,
        endDate: gapEnd,
        durationMonths: duration,
        isCurrent: false,
      });
    }
  }

  // Current gap: only exists if the most recent job has ended and nothing followed it
  let hasCareerGap = false;
  let gapDurationMonths = 0;

  const mostRecent = sorted[sorted.length - 1];
  if (mostRecent.endDate) {
    const duration = monthsBetween(new Date(mostRecent.endDate), new Date());
    if (duration > 0) {
      careerGaps.push({
        startDate: mostRecent.endDate,
        endDate: null,
        durationMonths: duration,
        isCurrent: true,
      });
      hasCareerGap = duration >= 6;
      gapDurationMonths = duration;
    }
  }

  return { careerGaps, hasCareerGap, gapDurationMonths };
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

    const { careerGaps, hasCareerGap, gapDurationMonths } =
      analyzeGaps(workHistory);

    const candidate = await Candidate.findByIdAndUpdate(
      req.user.id,
      { workHistory, careerGaps, hasCareerGap, gapDurationMonths },
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

// POST /api/candidate/extract-skills — the actual AI step.
// Reads the candidate's saved interview answers, sends them to the AI
// service, and saves the structured skill list back to their profile.
export const extractSkills = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.user.id);
    if (!candidate)
      return res.status(404).json({ message: "Candidate not found" });

    if (
      !candidate.breakInterviewAnswers ||
      candidate.breakInterviewAnswers.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "No interview answers found to extract skills from" });
    }

    const rawSkills = await extractSkillsFromInterview(
      candidate.breakInterviewAnswers,
    );

    // Map the AI's raw output into our schema shape
    const extractedSkills = rawSkills.map((s) => ({
      name: s.name,
      source: s.source,
      status: "maintained", // default — refined further once we build job matching in Step 8
    }));

    candidate.extractedSkills = extractedSkills;
    await candidate.save();

    const { password, ...safeCandidate } = candidate.toObject();
    res.json(safeCandidate);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
