import { useState } from "react";
import api from "../services/api";

// A fixed sequence of follow-up questions — deliberately scripted rather
// than fully AI-driven. This keeps the interview reliable for a live demo
// while still feeling conversational.
const questions = [
  "What responsibilities did you regularly handle during this time?",
  "Can you tell me more — how many people or tasks were you coordinating?",
  "Did you manage any budgets, schedules, or unexpected problems?",
  "Anything else you took on that you think is relevant to your next role?",
];

const SkillInterview = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [history, setHistory] = useState([]); // [{ question, answer }]
  const [submitting, setSubmitting] = useState(false);

  const handleNext = async () => {
    const updated = [
      ...history,
      { question: questions[step], answer: currentAnswer },
    ];
    setHistory(updated);
    setCurrentAnswer("");

    if (step + 1 < questions.length) {
      setStep(step + 1);
    } else {
      // Last question answered — save everything to the backend
      setSubmitting(true);
      const { data } = await api.post("/candidate/interview-answers", {
        answers: updated,
      });
      setSubmitting(false);
      onComplete(data);
    }
  };

  return (
    <div
      className="bg-white border border-border rounded-lg p-6 max-w-lg mx-auto"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <p className="text-xs font-semibold text-accent uppercase tracking-wide mb-4">
        Skill interview — question {step + 1} of {questions.length}
      </p>

      {/* Show prior Q&A as chat bubbles */}
      <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
        {history.map((h, i) => (
          <div key={i}>
            <div className="bg-accentLight text-accent text-sm rounded-lg rounded-bl-sm px-3 py-2 w-fit max-w-[85%] mb-1.5">
              {h.question}
            </div>
            <div className="bg-bg border border-border text-sm text-ink rounded-lg rounded-br-sm px-3 py-2 w-fit max-w-[85%] ml-auto">
              {h.answer}
            </div>
          </div>
        ))}
        <div className="bg-accentLight text-accent text-sm rounded-lg rounded-bl-sm px-3 py-2 w-fit max-w-[85%]">
          {questions[step]}
        </div>
      </div>

      <textarea
        value={currentAnswer}
        onChange={(e) => setCurrentAnswer(e.target.value)}
        placeholder="Type your answer..."
        rows={3}
        className="w-full border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent resize-none"
      />

      <button
        onClick={handleNext}
        disabled={!currentAnswer.trim() || submitting}
        className="mt-3 w-full bg-accent text-white py-2.5 rounded-md text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
      >
        {submitting
          ? "Saving..."
          : step + 1 < questions.length
            ? "Next question"
            : "Finish interview"}
      </button>
    </div>
  );
};

export default SkillInterview;
