import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    description: { type: String, required: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employer" },

    role: { type: String, default: "Professional" },
    experienceLevel: { type: String, default: "Mid-level" },
    location: { type: String, default: "Remote / Flexible" },
    workMode: { type: String, default: "Full-time" },

    // Structured skills extracted by Job Analysis Agent
    requiredSkills: [{ type: String }],
    importantSkills: [{ type: String }],
    optionalSkills: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model("Job", jobSchema);
