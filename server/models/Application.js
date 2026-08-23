import mongoose from "mongoose";

// This is the "join" model — it connects one candidate to one job,
// and stores the match results for that specific pairing.
const applicationSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },

    // What a traditional/old system would have scored — this powers your "before" in the before/after reveal
    baselineMatchScore: { type: Number, default: 0 },

    // The real SkillBridge score, after skill continuity analysis — this is the "after"
    matchScore: { type: Number, default: 0 },

    matchedSkills: [{ type: String }],
    skillsNeedingRefresh: [{ type: String }],

    status: {
      type: String,
      enum: ["applied", "shortlisted", "rejected", "hired"],
      default: "applied",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Application", applicationSchema);
