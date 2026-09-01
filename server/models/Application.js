import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    // Traditional ATS Score (Baseline: titles & resume keywords only)
    baselineMatchScore: { type: Number, default: 0 },

    // SkillBridge Score (After verified multi-source skill demonstration)
    matchScore: { type: Number, default: 0 },

    // Improvement difference (+X%)
    improvement: { type: Number, default: 0 },

    matchedSkills: [{ type: String }],
    skillsNeedingRefresh: [{ type: String }],

    // Detailed evidence supporting matched skills
    skillEvidence: [
      {
        skill: String,
        evidence: String,
        source: String,
        confidence: Number,
        strength: String,
      },
    ],

    // Overlooked flag & explainability
    potentiallyOverlooked: { type: Boolean, default: false },
    explanation: { type: String, default: "" },
    strengths: [{ type: String }],

    // Dynamic interview answers for this job application
    interviewAnswers: [
      {
        question: String,
        answer: String,
        targetSkill: String,
        analysis: String,
      },
    ],

    // Cached personalized guide for this job application
    personalizedGuide: {
      allSkillsDemonstrated: Boolean,
      skillsToImprove: [
        {
          skill: String,
          whyItMatters: String,
          currentStatus: String,
          roadmap: [String],
          resources: [
            {
              rank: Number,
              name: String,
              url: String,
              reason: String,
            },
          ],
          certifications: [
            {
              name: String,
              provider: String,
              reason: String,
            },
          ],
        },
      ],
      overallAdvice: String,
    },

    status: {
      type: String,
      enum: ["applied", "shortlisted", "rejected", "hired"],
      default: "applied",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Application", applicationSchema);
