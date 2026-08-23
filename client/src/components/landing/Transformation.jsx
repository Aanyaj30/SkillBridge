import { useEffect, useState } from "react";
import { useInView } from "../../hooks/useInView";

const skillChips = [
  { label: "Project Management", top: "6%", left: "-6%" },
  { label: "Communication", top: "-2%", left: "38%" },
  { label: "Leadership", top: "8%", left: "78%" },
  { label: "Planning", top: "62%", left: "-8%" },
  { label: "Stakeholder Management", top: "68%", left: "62%" },
];

// Animates 12 -> 78 once the section scrolls into view, instead of
// showing a static number — reinforces "this is a live calculation."
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
  const before = useCountUp(12, inView);
  const after = useCountUp(78, inView);

  return (
    <section ref={ref} className="max-w-5xl mx-auto px-6 py-24">
      <div className="text-center mb-14">
        <h2 className="text-2xl md:text-3xl font-semibold text-ink tracking-tight">
          Same person. Same career gap.
          <br />
          Completely different interpretation.
        </h2>
      </div>

      <div className="relative grid md:grid-cols-[1fr_auto_1fr] gap-8 md:gap-4 items-center">
        {/* BEFORE */}
        <div
          className="bg-white border border-border rounded-xl p-7 relative"
          style={{
            boxShadow: "var(--shadow-card)",
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(16px)",
            transition:
              "opacity 0.5s ease, transform 0.5s ease, box-shadow 0.2s ease",
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-inkSoft mb-5">
            Traditional hiring
          </p>
          <p className="text-sm text-ink mb-1">Career gap: 4 years</p>
          <p className="text-5xl font-semibold text-warning mt-3 mb-1">
            {before}%
          </p>
          <p className="text-sm text-warning/80 font-medium">Filtered out</p>
        </div>

        {/* CONNECTOR */}
        <div className="flex md:flex-col items-center justify-center gap-2 py-2">
          <div
            className="h-px md:h-16 md:w-px w-16 bg-gradient-to-r md:bg-gradient-to-b from-warning/40 via-accent to-positive/50"
            style={{
              transformOrigin: "left",
              transform: inView ? "scaleX(1)" : "scaleX(0)",
              transition: "transform 0.8s ease 0.2s",
            }}
          />
          <span className="text-xs font-medium text-accent whitespace-nowrap px-2">
            with SkillBridge
          </span>
          <div
            className="h-px md:h-16 md:w-px w-16 bg-gradient-to-r md:bg-gradient-to-b from-accent to-positive/50"
            style={{
              transformOrigin: "left",
              transform: inView ? "scaleX(1)" : "scaleX(0)",
              transition: "transform 0.8s ease 0.4s",
            }}
          />
        </div>

        {/* AFTER */}
        <div
          className="bg-white border border-accent/25 rounded-xl p-7 relative overflow-visible"
          style={{
            boxShadow: "var(--shadow-card)",
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(16px)",
            transition:
              "opacity 0.5s ease 0.15s, transform 0.5s ease 0.15s, box-shadow 0.2s ease",
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-accent mb-5">
            With SkillBridge
          </p>
          <p className="text-sm text-ink mb-1">Career gap: 4 years</p>
          <p className="text-5xl font-semibold text-positive mt-3 mb-1">
            {after}%
          </p>
          <p className="text-sm text-positive font-medium">
            12 skills discovered
          </p>

          {/* Floating skill chips — staggered fade-in, hidden on small screens to avoid clutter */}
          <div className="hidden lg:block">
            {skillChips.map((chip, i) => (
              <span
                key={chip.label}
                className="absolute bg-positiveLight text-positive text-xs font-medium
                           px-3 py-1.5 rounded-full border border-positive/20 whitespace-nowrap"
                style={{
                  top: chip.top,
                  left: chip.left,
                  animation: inView
                    ? `floatChip 0.5s ease ${0.6 + i * 0.12}s both`
                    : "none",
                  opacity: inView ? 1 : 0,
                }}
              >
                {chip.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Transformation;
