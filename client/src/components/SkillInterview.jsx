import { useState, useEffect, useRef } from "react";
import api from "../services/api";

const SkillInterview = ({ jobId, onComplete, onCancel }) => {
  const [session, setSession] = useState(null); // { question, targetSkill, questionNumber, maxQuestions }
  const [history, setHistory] = useState([]); // [{ question, answer, targetSkill, analysis }]
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, session, evaluating]);

  // Start dynamic interview on mount
  useEffect(() => {
    let isMounted = true;
    const startInterview = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.post("/candidate/interview/start", { jobId });
        if (isMounted) {
          setSession(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Could not start the AI skill interview."
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    startInterview();
    return () => {
      isMounted = false;
    };
  }, [jobId]);

  const handleSendAnswer = async (e) => {
    e?.preventDefault();
    if (!currentAnswer.trim() || evaluating || completed) return;

    const answerText = currentAnswer.trim();
    const currentQ = session?.question;
    const currentTarget = session?.targetSkill || "Core Competency";

    setEvaluating(true);
    setError("");

    try {
      const { data } = await api.post("/candidate/interview/answer", {
        jobId,
        question: currentQ,
        answer: answerText,
        targetSkill: currentTarget,
        interviewHistory: history,
      });

      const newHistoryItem = {
        question: currentQ,
        answer: answerText,
        targetSkill: currentTarget,
        analysis: data.analysis,
        skills: data.skills || [],
      };

      const updatedHistory = [...history, newHistoryItem];
      setHistory(updatedHistory);
      setCurrentAnswer("");

      if (data.completed || !data.shouldContinue) {
        // Complete the session and extract final skills
        setCompleted(true);
        const { data: updatedCandidate } = await api.post(
          "/candidate/interview/complete",
          {
            jobId,
            interviewHistory: updatedHistory,
          }
        );
        if (onComplete) {
          onComplete(updatedCandidate);
        }
      } else {
        setSession({
          question: data.question,
          targetSkill: data.targetSkill,
          questionNumber: data.questionNumber,
          maxQuestions: data.maxQuestions || 8,
        });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to process your response. Please try again."
      );
    } finally {
      setEvaluating(false);
    }
  };

  const handleFinishEarly = async () => {
    if (history.length === 0) {
      if (onCancel) onCancel();
      return;
    }
    setEvaluating(true);
    try {
      const { data: updatedCandidate } = await api.post(
        "/candidate/interview/complete",
        {
          jobId,
          interviewHistory: history,
        }
      );
      setCompleted(true);
      if (onComplete) {
        onComplete(updatedCandidate);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-border rounded-xl p-8 text-center max-w-xl mx-auto shadow-card">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full mb-4" />
        <p className="text-sm font-medium text-ink">
          SkillBridge AI is preparing your personalized skill assessment...
        </p>
        <p className="text-xs text-inkSoft mt-1">
          Analyzing job requirements and candidate context
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-xl p-6 max-w-xl mx-auto shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-positive animate-pulse" />
            <p className="text-xs font-bold text-accent uppercase tracking-wider">
              SkillBridge Adaptive Interview
            </p>
          </div>
          <p className="text-xs text-inkSoft mt-0.5">
            Demonstrating skills for: <span className="font-semibold text-ink">{session?.jobTitle || "Target Role"}</span>
          </p>
        </div>

        {session && (
          <div className="text-right">
            <span className="text-xs font-semibold bg-accentLight text-accent px-2.5 py-1 rounded-full">
              Question {session.questionNumber || history.length + 1} of up to {session.maxQuestions || 8}
            </span>
          </div>
        )}
      </div>

      {/* Language / Inclusivity banner */}
      <div className="bg-bg border border-border/80 rounded-lg px-3.5 py-2 mb-4 flex items-center justify-between text-xs text-inkSoft">
        <span>
          💡 <strong>Tip:</strong> Feel free to answer in English, Hindi, or Hinglish. We evaluate hands-on capability, not formal phrasing.
        </span>
        {history.length >= 2 && !completed && (
          <button
            type="button"
            onClick={handleFinishEarly}
            disabled={evaluating}
            className="text-xs text-accent font-medium hover:underline shrink-0 ml-2"
          >
            Finish assessment
          </button>
        )}
      </div>

      {/* Conversation Thread */}
      <div className="space-y-4 mb-4 max-h-96 overflow-y-auto pr-1">
        {history.map((turn, index) => (
          <div key={index} className="space-y-2">
            {/* AI Question */}
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-soft">
                AI
              </div>
              <div className="bg-accentLight/70 border border-accent/20 text-ink text-sm rounded-2xl rounded-tl-sm px-4 py-3 max-w-[88%] shadow-xs">
                {turn.targetSkill && (
                  <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-accent bg-white/80 px-2 py-0.5 rounded-full mb-1.5 border border-accent/15">
                    Target: {turn.targetSkill}
                  </span>
                )}
                <p className="leading-relaxed">{turn.question}</p>
              </div>
            </div>

            {/* Candidate Answer */}
            <div className="flex items-start justify-end gap-2.5">
              <div className="bg-ink text-white text-sm rounded-2xl rounded-tr-sm px-4 py-3 max-w-[88%] shadow-xs">
                <p className="leading-relaxed whitespace-pre-wrap">{turn.answer}</p>
              </div>
              <div className="w-7 h-7 rounded-full bg-inkSoft text-white flex items-center justify-center text-xs font-bold shrink-0">
                You
              </div>
            </div>

            {/* Verified Skills pill if any discovered in turn */}
            {turn.skills && turn.skills.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 ml-9">
                <span className="text-[11px] text-inkSoft font-medium">Demonstrated:</span>
                {turn.skills.map((sk, sIdx) => (
                  <span
                    key={sIdx}
                    className="text-[11px] font-medium bg-positiveLight text-positive border border-positive/20 px-2 py-0.5 rounded-full"
                  >
                    ✓ {sk.name} ({sk.strength || "Verified"})
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Current Active Question */}
        {!completed && session?.question && (
          <div className="flex items-start gap-2.5 animate-fadeIn">
            <div className="w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-soft">
              AI
            </div>
            <div className="bg-accentLight/70 border border-accent/20 text-ink text-sm rounded-2xl rounded-tl-sm px-4 py-3 max-w-[88%] shadow-xs">
              {session.targetSkill && (
                <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-accent bg-white/80 px-2 py-0.5 rounded-full mb-1.5 border border-accent/15">
                  Target: {session.targetSkill}
                </span>
              )}
              <p className="leading-relaxed font-medium">{session.question}</p>
            </div>
          </div>
        )}

        {/* Thinking Indicator */}
        {evaluating && (
          <div className="flex items-center gap-2.5 text-accent text-sm pl-9 animate-pulse">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-accent rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
            <span className="text-xs font-medium text-inkSoft">SkillBridge is evaluating your response...</span>
          </div>
        )}

        {/* Completed Message */}
        {completed && (
          <div className="bg-positiveLight border border-positive/30 rounded-xl p-4 text-center animate-fadeIn">
            <p className="text-sm font-semibold text-positive">
              🎉 Assessment completed successfully!
            </p>
            <p className="text-xs text-inkSoft mt-1">
              All demonstrated skills and verified evidence have been added to your profile.
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input box */}
      {!completed && (
        <form onSubmit={handleSendAnswer} className="space-y-3">
          <textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Share your practical experience, projects, or problem-solving approaches..."
            rows={3}
            disabled={evaluating}
            className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none transition-all"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendAnswer();
              }
            }}
          />

          <div className="flex items-center justify-between gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={evaluating}
                className="text-xs text-inkSoft hover:text-ink px-3 py-2"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={!currentAnswer.trim() || evaluating}
              className="ml-auto bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-accent/90 transition-all shadow-soft disabled:opacity-50 flex items-center gap-2"
            >
              {evaluating ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>Submit Answer →</>
              )}
            </button>
          </div>
        </form>
      )}

      {error && <p className="text-xs text-warning mt-3 bg-warningLight/50 p-2.5 rounded-lg">{error}</p>}
    </div>
  );
};

export default SkillInterview;
