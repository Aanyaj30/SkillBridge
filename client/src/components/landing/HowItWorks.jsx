import { useEffect, useState } from "react";
import { useInView } from "../../hooks/useInView";

const steps = [
  {
    label: "Ingest & Parse",
    desc: "Eden AI parses structured resume data, education history, and certifications without fabricating unmentioned skills.",
  },
  {
    label: "Verify Evidence",
    desc: "Candidate Evidence Agent tags skills with concrete evidence from practical projects, repositories, and past roles.",
  },
  {
    label: "Adaptive Interview",
    desc: "Dynamic conversational interview targets undemonstrated job requirements in natural English, Hindi, or Hinglish.",
  },
  {
    label: "Match & Guide",
    desc: "Deterministic matching provides transparent before/after scores, explainable evidence dossiers, and ranked learning roadmaps.",
  },
];

const StepPreview = ({ index }) => {
  if (index === 0) {
    return (
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between text-inkSoft">
          <span>Eden AI OCR Parser</span>
          <span className="text-accent font-semibold">100% Grounded</span>
        </div>
        <div className="bg-bg border border-border rounded-xl p-3 text-[11px] font-mono text-ink space-y-1">
          <p className="text-positive font-bold">✓ Education: B.Tech Computer Science</p>
          <p className="text-positive font-bold">✓ Skills: React, Node.js, REST APIs</p>
          <p className="text-inkSoft">○ Docker: (Not present → Not extracted)</p>
        </div>
      </div>
    );
  }
  if (index === 1) {
    return (
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {["React", "Node.js", "REST APIs", "State Management"].map((s, i) => (
            <span
              key={s}
              className="bg-positiveLight text-positive text-xs font-semibold px-2.5 py-1 rounded-full border border-positive/20"
              style={{ animation: `floatChip 0.4s ease ${i * 0.1}s both` }}
            >
              ✓ {s}
            </span>
          ))}
        </div>
        <p className="text-[11px] text-inkSoft pt-1">
          Evidence: Verified in StoreSphere E-Commerce Project
        </p>
      </div>
    );
  }
  if (index === 2) {
    return (
      <div className="space-y-2 text-xs text-left">
        <div className="bg-accentLight text-accent text-[11px] rounded-lg px-3 py-2 w-fit max-w-[90%] font-medium">
          "How did you structure API error boundaries in your React application?"
        </div>
        <div className="bg-bg border border-border text-[11px] text-ink rounded-lg px-3 py-2 w-fit max-w-[90%] ml-auto font-medium">
          "Maine Axios interceptors aur retry logic implement kiya tha taaki network failures gracefully handle ho sakein."
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-2 text-xs">
      <div className="flex justify-between text-inkSoft mb-1">
        <span>Traditional ATS: <strong>30%</strong></span>
        <span className="text-positive font-bold">SkillBridge: 88% (+58%)</span>
      </div>
      <div className="h-2 bg-border rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-accent to-positive rounded-full" style={{ width: "88%" }} />
      </div>
      <p className="text-[11px] text-accent font-medium pt-1">
        + Personalized Guide with 3 ranked learning milestones
      </p>
    </div>
  );
};

const HowItWorks = () => {
  const [ref, inView] = useInView(0.3);
  const [active, setActive] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!inView || !autoPlay) return;
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % steps.length);
    }, 3600);
    return () => clearInterval(interval);
  }, [inView, autoPlay]);

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="max-w-5xl mx-auto px-6 py-20 border-t border-border"
    >
      <div className="text-center mb-12">
        <span className="text-xs font-bold text-accent uppercase tracking-wider">
          The Platform Workflow
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight mt-1">
          How Skill-First Evaluation Works
        </h2>
      </div>

      {/* Step Indicators */}
      <div className="relative flex justify-between mb-10 max-w-2xl mx-auto">
        <div className="absolute top-3.5 left-0 right-0 h-px bg-border" />
        <div
          className="absolute top-3.5 left-0 h-px bg-accent transition-all duration-500 ease-out"
          style={{ width: `${(active / (steps.length - 1)) * 100}%` }}
        />
        {steps.map((step, i) => (
          <button
            key={step.label}
            onClick={() => {
              setActive(i);
              setAutoPlay(false);
            }}
            className="relative flex flex-col items-center gap-2 z-10 bg-bg px-2 cursor-pointer"
          >
            <span
              className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-300 shadow-xs"
              style={{
                borderColor: i <= active ? "var(--color-accent)" : "var(--color-border)",
                backgroundColor: i === active ? "var(--color-accent)" : "#ffffff",
                color: i === active ? "#fff" : "var(--color-ink-soft)",
              }}
            >
              {i + 1}
            </span>
            <span
              className={`text-xs font-semibold transition-colors ${
                i === active ? "text-ink font-bold" : "text-inkSoft"
              }`}
            >
              {step.label}
            </span>
          </button>
        ))}
      </div>

      {/* Active step detail container */}
      <div className="grid md:grid-cols-2 gap-8 items-center bg-white border border-border rounded-2xl p-8 shadow-card max-w-4xl mx-auto">
        <div className="space-y-2">
          <p className="text-xs font-bold text-accent uppercase tracking-wider">
            Step {active + 1} of {steps.length}
          </p>
          <h3 className="text-xl font-bold text-ink">
            {steps[active].label}
          </h3>
          <p className="text-xs sm:text-sm text-inkSoft leading-relaxed">
            {steps[active].desc}
          </p>
        </div>

        <div className="bg-bg rounded-xl p-5 border border-border min-h-[140px] flex items-center">
          <div className="w-full" key={active}>
            <StepPreview index={active} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
