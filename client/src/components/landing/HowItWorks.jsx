import { useEffect, useState } from "react";
import { useInView } from "../../hooks/useInView";

const steps = [
  {
    label: "Interview",
    desc: "A short conversation surfaces what you actually did during your career break.",
  },
  {
    label: "Extract",
    desc: "AI identifies transferable professional skills from what you describe.",
  },
  {
    label: "Match",
    desc: "Your skills are compared against a real job's actual requirements.",
  },
  {
    label: "Guide",
    desc: "See your skill alignment score and a personalized path to close any gaps.",
  },
];

// Small, self-contained UI previews for each step — makes the section
// feel like you're watching the product work, not reading about it.
const StepPreview = ({ index }) => {
  if (index === 0) {
    return (
      <div className="space-y-2.5 text-left">
        <div className="bg-accentLight text-accent text-xs rounded-lg rounded-bl-sm px-3 py-2 w-fit max-w-[85%]">
          What did you do during your break?
        </div>
        <div className="bg-bg border border-border text-xs text-ink rounded-lg rounded-br-sm px-3 py-2 w-fit max-w-[85%] ml-auto">
          Managed our monthly budget and my kids' school schedules.
        </div>
      </div>
    );
  }
  if (index === 1) {
    return (
      <div className="flex flex-wrap gap-2">
        {["Budget Management", "Scheduling", "Coordination"].map((s, i) => (
          <span
            key={s}
            className="bg-positiveLight text-positive text-xs font-medium px-3 py-1.5 rounded-full border border-positive/20"
            style={{ animation: `floatChip 0.4s ease ${i * 0.12}s both` }}
          >
            {s}
          </span>
        ))}
      </div>
    );
  }
  if (index === 2) {
    return (
      <div>
        <div className="flex justify-between text-xs text-inkSoft mb-2">
          <span>Skill alignment</span>
          <span className="text-positive font-semibold">78%</span>
        </div>
        <div className="h-2 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-positive rounded-full"
            style={{ width: "78%" }}
          />
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-2 text-xs">
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-positive" />
        <span className="text-ink">Excel refresh — Week 1</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
        <span className="text-ink">Agile fundamentals — Week 2</span>
      </div>
    </div>
  );
};

const HowItWorks = () => {
  const [ref, inView] = useInView(0.3);
  const [active, setActive] = useState(0);

  // Auto-advance through steps while the section is in view, but stop
  // if the user manually clicks a step (respecting their intent).
  const [autoPlay, setAutoPlay] = useState(true);
  useEffect(() => {
    if (!inView || !autoPlay) return;
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % steps.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [inView, autoPlay]);

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="max-w-5xl mx-auto px-6 py-24 border-t border-border"
    >
      <h2 className="text-2xl md:text-3xl font-semibold text-ink text-center mb-14 tracking-tight">
        How it works
      </h2>

      {/* Progress line + step labels */}
      <div className="relative flex justify-between mb-12">
        <div className="absolute top-3 left-0 right-0 h-px bg-border" />
        <div
          className="absolute top-3 left-0 h-px bg-accent transition-all duration-500 ease-out"
          style={{ width: `${(active / (steps.length - 1)) * 100}%` }}
        />
        {steps.map((step, i) => (
          <button
            key={step.label}
            onClick={() => {
              setActive(i);
              setAutoPlay(false);
            }}
            className="relative flex flex-col items-center gap-3 z-10 bg-bg px-2"
          >
            <span
              className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-[11px] font-semibold transition-all duration-300"
              style={{
                borderColor:
                  i <= active ? "var(--color-accent)" : "var(--color-border)",
                backgroundColor:
                  i === active ? "var(--color-accent)" : "var(--color-bg)",
                color: i === active ? "#fff" : "var(--color-ink-soft)",
              }}
            >
              {i + 1}
            </span>
            <span
              className={`text-sm font-medium transition-colors ${
                i === active ? "text-ink" : "text-inkSoft"
              }`}
            >
              {step.label}
            </span>
          </button>
        ))}
      </div>

      {/* Active step content */}
      <div
        className="grid md:grid-cols-2 gap-10 items-center bg-white border border-border rounded-xl p-8"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div>
          <p className="text-xs font-semibold text-accent uppercase tracking-wide mb-3">
            Step {active + 1} of {steps.length}
          </p>
          <h3 className="text-xl font-semibold text-ink mb-3">
            {steps[active].label}
          </h3>
          <p className="text-sm text-inkSoft leading-relaxed">
            {steps[active].desc}
          </p>
        </div>
        <div className="bg-bg rounded-lg p-5 border border-border min-h-[110px] flex items-center">
          <div className="w-full" key={active}>
            <StepPreview index={active} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
