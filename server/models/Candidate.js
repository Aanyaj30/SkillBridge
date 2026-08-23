import mongoose from "mongoose";

// A single skill entry — used inside a candidate's extractedSkills list
const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    status: {
      type: String,
      enum: ["maintained", "needs_refresh", "new"],
      default: "maintained",
    },
    source: { type: String }, // e.g. "break activity" or "past job" — where this skill came from
  },
  { _id: false }, // don't need a separate id for each skill, it's just a sub-item
);

// One job the candidate held in the past (or currently holds)
const workHistoryItemSchema = new mongoose.Schema(
  {
    title: String,
    company: String,
    startDate: Date,
    endDate: Date, // leave empty/null if this is their current job
  },
  { _id: false },
);

// One question+answer pair from the AI's conversational skill interview
const interviewAnswerSchema = new mongoose.Schema(
  {
    question: String,
    answer: String,
  },
  { _id: false },
);

const candidateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // we'll store this hashed, never plain text

    workHistory: [workHistoryItemSchema],

    // These two get calculated automatically from workHistory gaps (we'll write that logic in Step 6)
    hasCareerGap: { type: Boolean, default: false },
    gapDurationMonths: { type: Number, default: 0 },

    // The candidate's free-text answers about what they did during the gap
    breakInterviewAnswers: [interviewAnswerSchema],

    // Filled in after the AI extracts skills from breakInterviewAnswers (Step 7)
    extractedSkills: [skillSchema],
  },
  { timestamps: true }, // adds createdAt / updatedAt automatically
);

export default mongoose.model("Candidate", candidateSchema);
