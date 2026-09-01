import Application from "../models/Application.js";
import Candidate from "../models/Candidate.js";
import Job from "../models/Job.js";
import { computeMatch } from "../services/matching.js";
import {
  evaluateMatchEvidence,
  generatePersonalizedGuide,
} from "../services/aiService.js";

// POST /api/application/apply — Apply to a job with explainable multi-agent evaluation
export const applyToJob = async (req, res) => {
  try {
    const { jobId } = req.body;

    const candidate = await Candidate.findById(req.user.id);
    const job = await Job.findById(jobId);

    if (!job) return res.status(404).json({ message: "Job not found" });

    // MANDATORY REQUIREMENTS CHECK:
    // Every candidate must have a completed profile (Resume + Work History + at least 1 Project)
    const missingRequirements = [];
    if (!candidate.resumeText || !candidate.resumeText.trim()) {
      missingRequirements.push("Resume (Please upload or paste your resume)");
    }
    if (!candidate.workHistory || candidate.workHistory.length === 0) {
      missingRequirements.push("Work History (Please add past roles or experience)");
    }
    if (!candidate.projects || candidate.projects.length === 0) {
      missingRequirements.push("Practical Project (Please add at least 1 project demonstrating skills)");
    }

    if (missingRequirements.length > 0) {
      return res.status(400).json({
        message: "Mandatory profile requirements missing. Please complete your profile before applying.",
        incompleteProfile: true,
        missingRequirements,
      });
    }

    // Check if candidate needs the dynamic interview
    const hasEvidence =
      (candidate.skillEvidence && candidate.skillEvidence.length > 0) ||
      (candidate.extractedSkills && candidate.extractedSkills.length > 0) ||
      (candidate.projects && candidate.projects.length > 0);

    const interviewNotDone =
      !candidate.breakInterviewAnswers || candidate.breakInterviewAnswers.length === 0;

    // Trigger dynamic interview if candidate has a CURRENT ongoing gap and no interview answers yet
    if (candidate.hasCareerGap && interviewNotDone && !hasEvidence) {
      return res.status(409).json({
        message: "Skill interview required before applying to discover your demonstrated skills.",
        requiresInterview: true,
      });
    }

    // 1. Deterministic Scoring Engine computation
    const deterministicResult = computeMatch(
      candidate,
      job,
      candidate.breakInterviewAnswers || []
    );

    // 2. Multi-Agent Evaluation & Narrative (Matching Agent)
    let aiEvaluation = {
      explanation: "Skills evaluated against required job proficiencies.",
      strengths: deterministicResult.matchedSkills,
      whyScoreImproved:
        "SkillBridge evaluated practical evidence from projects, experience, and assessment beyond conventional keyword screening.",
    };

    try {
      aiEvaluation = await evaluateMatchEvidence({
        jobTitle: job.title,
        requiredSkills: job.requiredSkills || [],
        importantSkills: job.importantSkills || job.requiredSkills || [],
        candidateEvidence: deterministicResult.skillEvidence,
        interviewAnswers: candidate.breakInterviewAnswers || [],
        workHistory: candidate.workHistory || [],
      });
    } catch (aiErr) {
      console.warn("AI evaluation fallback used:", aiErr.message);
    }

    // 3. Candidate Guide Generation (Guide Agent)
    let candidateGuide = {
      allSkillsDemonstrated: deterministicResult.skillsNeedingRefresh.length === 0,
      skillsToImprove: [],
      overallAdvice: "Focus on strengthening missing role proficiencies.",
    };

    if (deterministicResult.skillsNeedingRefresh.length > 0) {
      try {
        candidateGuide = await generatePersonalizedGuide({
          jobTitle: job.title,
          requiredSkills: job.requiredSkills || [],
          demonstratedSkills: deterministicResult.matchedSkills,
          missingSkills: deterministicResult.skillsNeedingRefresh,
        });
      } catch (guideErr) {
        console.warn("Guide agent fallback used:", guideErr.message);
      }
    }

    // 4. Upsert application
    const application = await Application.findOneAndUpdate(
      { candidate: candidate._id, job: job._id },
      {
        candidate: candidate._id,
        job: job._id,
        baselineMatchScore: deterministicResult.baselineMatchScore,
        matchScore: deterministicResult.matchScore,
        improvement: deterministicResult.improvement,
        matchedSkills: deterministicResult.matchedSkills,
        skillsNeedingRefresh: deterministicResult.skillsNeedingRefresh,
        skillEvidence: deterministicResult.skillEvidence,
        potentiallyOverlooked: deterministicResult.potentiallyOverlooked,
        explanation: aiEvaluation.explanation || aiEvaluation.whyScoreImproved || "",
        strengths: aiEvaluation.strengths || deterministicResult.matchedSkills,
        interviewAnswers: candidate.breakInterviewAnswers || [],
        personalizedGuide: candidateGuide,
        status: "applied",
      },
      { upsert: true, returnDocument: "after" }
    ).populate("job");

    res.json(application);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/application/my — candidate's own applications
export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({
      candidate: req.user.id,
    })
      .populate("job")
      .sort("-createdAt");
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/application/job/:jobId — employer's candidate pipeline for one job
export const getApplicationsForJob = async (req, res) => {
  try {
    const applications = await Application.find({ job: req.params.jobId })
      .populate("candidate", "-password")
      .sort("-matchScore");
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/application/:id/details — single application full details
export const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate("candidate", "-password")
      .populate("job");

    if (!application) return res.status(404).json({ message: "Application not found" });
    res.json(application);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
