import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Candidate from "../models/Candidate.js";
import Employer from "../models/Employer.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// --- CANDIDATE ---

export const registerCandidate = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await Candidate.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ message: "An account with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const candidate = await Candidate.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      _id: candidate._id,
      name: candidate.name,
      email: candidate.email,
      token: generateToken(candidate._id, "candidate"),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const loginCandidate = async (req, res) => {
  try {
    const { email, password } = req.body;

    const candidate = await Candidate.findOne({ email });
    if (!candidate) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, candidate.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      _id: candidate._id,
      name: candidate.name,
      email: candidate.email,
      token: generateToken(candidate._id, "candidate"),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- EMPLOYER ---

export const registerEmployer = async (req, res) => {
  try {
    const { companyName, email, password } = req.body;

    const existing = await Employer.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ message: "An account with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const employer = await Employer.create({
      companyName,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      _id: employer._id,
      companyName: employer.companyName,
      email: employer.email,
      token: generateToken(employer._id, "employer"),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const loginEmployer = async (req, res) => {
  try {
    const { email, password } = req.body;

    const employer = await Employer.findOne({ email });
    if (!employer) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, employer.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      _id: employer._id,
      companyName: employer.companyName,
      email: employer.email,
      token: generateToken(employer._id, "employer"),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/auth/profile — Deletes current candidate or employer account and all associated data
export const deleteUserAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const isCandidate = Boolean(req.user.name);

    if (isCandidate) {
      await Application.deleteMany({ candidate: userId });
      await Candidate.findByIdAndDelete(userId);
    } else {
      const employerJobs = await Job.find({ employer: userId });
      const jobIds = employerJobs.map((j) => j._id);
      await Application.deleteMany({ job: { $in: jobIds } });
      await Job.deleteMany({ employer: userId });
      await Employer.findByIdAndDelete(userId);
    }

    res.json({ message: "Account and all associated records permanently deleted." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
