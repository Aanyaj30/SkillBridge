import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    description: { type: String, required: true }, // the raw pasted job description

    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employer" },

    // Filled in automatically by AI when the job is posted (Step 8)
    requiredSkills: [{ type: String }],
  },
  { timestamps: true },
);

export default mongoose.model("Job", jobSchema);
