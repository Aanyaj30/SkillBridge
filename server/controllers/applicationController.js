import Application from "../models/Application.js";
import Candidate from "../models/Candidate.js";
import Job from "../models/Job.js";
import { computeMatch } from "../services/matching.js";

// POST /api/application/apply — the real trigger point for the skill
// interview. If the candidate has a CURRENT gap and hasn't extracted
// skills yet, we refuse to apply and tell the frontend to run the
// interview first — matching the product logic we agreed on.
export const applyToJob = async (req, res) => {
  try {
    const { jobId } = req.body;

    const candidate = await Candidate.findById(req.user.id);
    const job = await Job.findById(jobId);

    if (!job) return res.status(404).json({ message: "Job not found" });

    const interviewNotDone =
      !candidate.extractedSkills || candidate.extractedSkills.length === 0;

    if (candidate.hasCareerGap && interviewNotDone) {
      return res.status(409).json({
        message: "Skill interview required before applying",
        requiresInterview: true,
      });
    }

    const {
      baselineMatchScore,
      matchScore,
      matchedSkills,
      skillsNeedingRefresh,
    } = computeMatch(candidate, job);

    // upsert: if they already applied to this job, update the scores
    // instead of creating a duplicate application
    const application = await Application.findOneAndUpdate(
      { candidate: candidate._id, job: job._id },
      {
        candidate: candidate._id,
        job: job._id,
        baselineMatchScore,
        matchScore,
        matchedSkills,
        skillsNeedingRefresh,
        status: "applied",
      },
      { upsert: true, new: true },
    );

    res.json(application);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/application/my — candidate's own applications, with job details
export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({
      candidate: req.user.id,
    }).populate("job");
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/application/job/:jobId — employer's candidate pipeline for one job (Step 9)
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
