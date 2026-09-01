import Job from "../models/Job.js";
import Employer from "../models/Employer.js";
import { analyzeJobPosting } from "../services/aiService.js";

// POST /api/job — employer posts a job, Job Analysis Agent extracts skills
export const createJob = async (req, res) => {
  try {
    if (req.user.role !== "employer") {
      return res.status(403).json({ message: "Only employers can post jobs" });
    }

    const { title, description, location, workMode, experienceLevel } = req.body;
    const employer = await Employer.findById(req.user.id);

    // Call Job Analysis Agent
    const analysis = await analyzeJobPosting(description, title);

    const job = await Job.create({
      title: title || analysis.role,
      description,
      company: employer?.companyName || "SkillBridge Partner",
      postedBy: req.user.id,
      role: analysis.role || title,
      experienceLevel: experienceLevel || analysis.experienceLevel || "Mid-level",
      location: location || "Remote / Flexible",
      workMode: workMode || "Full-time",
      requiredSkills: analysis.requiredSkills || [],
      importantSkills: analysis.importantSkills || analysis.requiredSkills || [],
      optionalSkills: analysis.optionalSkills || [],
    });

    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/job — candidates browse all jobs
export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort("-createdAt");
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/job/my — employer's own posted jobs only
export const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user.id }).sort("-createdAt");
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/job/:id — single job detail
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
