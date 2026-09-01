import mongoose from "mongoose";

// A single verified skill evidence item with source and strength
const skillEvidenceSchema = new mongoose.Schema(
  {
    skill: { type: String, required: true },
    evidence: { type: String, default: "" },
    source: {
      type: String,
      enum: ["resume", "work_history", "project", "certificate", "profile", "interview", "break activity", "past job"],
      default: "profile",
    },
    confidence: { type: Number, default: 0.8 },
    strength: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },
  },
  { _id: false }
);

// Backwards-compatible extracted skill schema
const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    status: {
      type: String,
      enum: ["maintained", "needs_refresh", "new"],
      default: "maintained",
    },
    source: { type: String },
  },
  { _id: false }
);

// Candidate education
const educationSchema = new mongoose.Schema(
  {
    degree: { type: String, default: "" },
    institution: { type: String, default: "" },
    graduationYear: { type: String, default: "" },
  },
  { _id: false }
);

// Candidate past/current jobs
const workHistoryItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    startDate: Date,
    endDate: Date,
    description: String,
  },
  { _id: false }
);

// Candidate projects
const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    technologies: [{ type: String }],
    link: { type: String, default: "" },
  },
  { _id: false }
);

// Candidate certificates
const certificateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    issuer: { type: String, required: true },
    date: { type: String, default: "" },
    verificationUrl: { type: String, default: "" },
    skills: [{ type: String }],
  },
  { _id: false }
);

// Detected career gaps
const careerGapSchema = new mongoose.Schema(
  {
    startDate: Date,
    endDate: Date,
    durationMonths: Number,
    isCurrent: { type: Boolean, default: false },
    reason: { type: String, default: "" },
  },
  { _id: false }
);

// Interview Q&A turns
const interviewAnswerSchema = new mongoose.Schema(
  {
    question: String,
    answer: String,
    targetSkill: String,
    analysis: String,
  },
  { _id: false }
);

const candidateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    bio: { type: String, default: "" },
    profileLinks: {
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
      portfolio: { type: String, default: "" },
    },

    resumeText: { type: String, default: "" },

    education: [educationSchema],
    workHistory: [workHistoryItemSchema],
    projects: [projectSchema],
    certificates: [certificateSchema],

    careerGaps: [careerGapSchema],
    hasCareerGap: { type: Boolean, default: false },
    gapDurationMonths: { type: Number, default: 0 },

    // Reusable multi-source evidence repository
    skillEvidence: [skillEvidenceSchema],

    // Break/adaptive interview answers
    breakInterviewAnswers: [interviewAnswerSchema],

    // Extracted skills list (kept for backwards compatibility)
    extractedSkills: [skillSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Candidate", candidateSchema);
