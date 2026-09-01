import { useEffect, useState } from "react";
import { useInView } from "../../hooks/useInView";

const skillChips = [
  { label: "React Component Architecture", top: "6%", left: "-4%" },
  { label: "REST APIs with Axios", top: "-2%", left: "42%" },
  { label: "Node.js & Express", top: "8%", left: "75%" },
  { label: "State Management", top: "64%", left: "-6%" },
  { label: "Error Boundaries & Debugging", top: "70%", left: "55%" },
];

const useCountUp = (target, inView, duration = 900) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setValue(Math.round(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration]);
  return value;
};

const Transformation = () => {
  const [ref, inView] = useInView(0.3);
  const before = useCountUp(30, inView);
  const after = useCountUp(88, inView);

  return (
    <section ref={ref} className="max-w-5xl mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <span className="text-xs font-bold text-accent uppercase tracking-wider">
          Transparent Before vs After
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight mt-1">
          Same Candidate. Same Background.
          <br />
          Grounded Evidence-Based Evaluation.
        </h2>
      </div>

      <div className="relative grid md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
        {/* BEFORE: Traditional ATS */}
        <div
          className="bg-white border border-border rounded-2xl p-7 relative"
          style={{
            boxShadow: "var(--shadow-card)",
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(16px)",
            transition: "all 0.5s ease",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-inkSoft">
              Traditional Keyword ATS
            </span>
            <span className="text-[10px] font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded">
              Filtered Out
            </span>
          </div>

          <p className="text-xs text-inkSoft">Candidate Profile: Priya Sharma</p>
          <p className="text-sm font-semibold text-ink mt-0.5">Role: Frontend Developer</p>

          <div className="mt-4 pt-3 border-t border-border space-y-1">
            <p className="text-xs text-inkSoft">Baseline Resume Score:</p>
            <p className="text-4xl sm:text-5xl font-bold text-red-600">
              {before}%
            </p>
          </div>

          <div className="mt-4 bg-red-50 border border-red-200/60 rounded-xl p-3 text-xs text-red-900 space-y-1">
            <p className="font-semibold">Reason for Low Score:</p>
            <p className="text-[11px] text-red-800">
              Keyword filter penalizes 2-year timeline gap and doesn't verify practical repository code or live technical answers.
            </p>
          </div>
        </div>

        {/* CONNECTOR */}
        <div className="flex md:flex-col items-center justify-center gap-2 py-2">
          <div
            className="h-px md:h-16 md:w-px w-16 bg-gradient-to-r md:bg-gradient-to-b from-red-300 via-accent to-emerald-500"
            style={{
              transformOrigin: "left",
              transform: inView ? "scaleX(1)" : "scaleX(0)",
              transition: "transform 0.8s ease 0.2s",
            }}
          />
          <span className="text-xs font-bold text-accent whitespace-nowrap bg-accentLight px-3 py-1 rounded-full border border-accent/20">
            with SkillBridge
          </span>
          <div
            className="h-px md:h-16 md:w-px w-16 bg-gradient-to-r md:bg-gradient-to-b from-accent to-emerald-500"
            style={{
              transformOrigin: "left",
              transform: inView ? "scaleX(1)" : "scaleX(0)",
              transition: "transform 0.8s ease 0.4s",
            }}
          />
        </div>

        {/* AFTER: SkillBridge Evidence */}
        <div
          className="bg-white border border-accent/40 rounded-2xl p-7 relative overflow-visible shadow-card"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(16px)",
            transition: "all 0.5s ease 0.15s",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-accent">
              SkillBridge Verified Match
            </span>
            <span className="text-[10px] font-bold bg-positiveLight text-positive border border-positive/30 px-2 py-0.5 rounded-full">
              ⚡ Overlooked Talent Match (+58%)
            </span>
          </div>

          <p className="text-xs text-inkSoft">Candidate Profile: Priya Sharma</p>
          <p className="text-sm font-semibold text-ink mt-0.5">Role: Frontend Developer</p>

          <div className="mt-4 pt-3 border-t border-border space-y-1">
            <p className="text-xs text-inkSoft">Demonstrated Skill Score:</p>
            <p className="text-4xl sm:text-5xl font-bold text-positive">
              {after}%
            </p>
          </div>

          <div className="mt-4 bg-positiveLight border border-positive/30 rounded-xl p-3 text-xs text-emerald-950 space-y-1">
            <p className="font-semibold text-positive">Verified Evidence Trail:</p>
            <p className="text-[11px] text-emerald-900">
              Verified React store project, Axios REST APIs integration, and live Hinglish technical interview answers.
            </p>
          </div>

          {/* Floating skill chips */}
          <div className="hidden lg:block">
            {skillChips.map((chip, i) => (
              <span
                key={chip.label}
                className="absolute bg-positiveLight text-positive text-xs font-semibold
                           px-3 py-1 rounded-full border border-positive/25 whitespace-nowrap shadow-xs"
                style={{
                  top: chip.top,
                  left: chip.left,
                  animation: inView
                    ? `floatChip 0.5s ease ${0.6 + i * 0.12}s both`
                    : "none",
                  opacity: inView ? 1 : 0,
                }}
              >
                ✓ {chip.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Transformation;
