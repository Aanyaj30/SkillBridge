import Job from "../models/Job.js";
import Employer from "../models/Employer.js";
import { extractRequiredSkillsFromDescription } from "../services/aiService.js";

// POST /api/job — employer posts a job, AI extracts required skills
export const createJob = async (req, res) => {
  try {
    if (req.user.role !== "employer") {
      return res.status(403).json({ message: "Only employers can post jobs" });
    }

    const { title, description } = req.body;
    const employer = await Employer.findById(req.user.id);

    const requiredSkills =
      await extractRequiredSkillsFromDescription(description);

    const job = await Job.create({
      title,
      description,
      company: employer.companyName,
      postedBy: req.user.id,
      requiredSkills,
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
