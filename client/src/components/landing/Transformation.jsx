import { useInView } from "../../hooks/useInView";

const skillChips = [
  { label: "React Component Architecture", top: "4%", left: "-4%" },
  { label: "REST APIs with Axios", top: "-4%", left: "44%" },
  { label: "Node.js & Express", top: "6%", left: "76%" },
  { label: "State Management", top: "68%", left: "-6%" },
  { label: "Error Boundaries & Retry Logic", top: "72%", left: "54%" },
];

const Transformation = () => {
  const [ref, inView] = useInView(0.3);

  return (
    <section ref={ref} className="max-w-5xl mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-bg border border-border px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-inkSoft mb-3">
          Illustrative Comparison
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
          Traditional Resume Screening vs. Evidence-Based Skill Evaluation
        </h2>
        <p className="text-xs sm:text-sm text-inkSoft mt-2 max-w-2xl mx-auto">
          Comparing conventional screening criteria against SkillBridge's evidence-grounded evaluation.
        </p>
      </div>

      <div className="relative grid md:grid-cols-[1fr_auto_1fr] gap-6 items-stretch">
        {/* BEFORE: Traditional Resume Screening */}
        <div
          className="bg-white border border-border rounded-2xl p-7 relative flex flex-col justify-between"
          style={{
            boxShadow: "var(--shadow-card)",
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(16px)",
            transition: "all 0.5s ease",
          }}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-inkSoft">
                Traditional Resume Screening
              </span>
              <span className="text-[10px] font-bold bg-ink/5 text-inkSoft px-2 py-0.5 rounded">
                Conventional Signals
              </span>
            </div>

            <p className="text-xs text-inkSoft font-medium leading-relaxed">
              Can over-rely on titles, keywords, employment history, and conventional resume signals.
            </p>

            <div className="mt-5 pt-4 border-t border-border space-y-2.5 text-xs text-ink">
              <p className="text-[11px] font-bold uppercase tracking-wider text-inkSoft">
                Primary Screening Factors:
              </p>
              <ul className="space-y-1.5 text-xs text-inkSoft">
                <li className="flex items-center gap-2">
                  <span className="text-inkSoft">✕</span> Exact job title alignment
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-inkSoft">✕</span> Unbroken employment timeline
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-inkSoft">✕</span> Static resume keyword density
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-inkSoft">✕</span> Institution & university pedigree
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 bg-red-50/70 border border-red-200/60 rounded-xl p-3.5 text-xs text-red-900 space-y-1">
            <p className="font-semibold text-red-800">The Overlooked Talent Risk:</p>
            <p className="text-[11px] text-red-800 leading-relaxed">
              Candidates with non-linear career paths, employment gaps, or self-directed project portfolios are often filtered out before their practical skills can be evaluated.
            </p>
          </div>
        </div>

        {/* CONNECTOR */}
        <div className="flex md:flex-col items-center justify-center gap-2 py-2">
          <div
            className="h-px md:h-16 md:w-px w-16 bg-gradient-to-r md:bg-gradient-to-b from-border via-accent to-emerald-500"
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

        {/* AFTER: SkillBridge Evidence Evaluation */}
        <div
          className="bg-white border border-accent/40 rounded-2xl p-7 relative overflow-visible shadow-card flex flex-col justify-between"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(16px)",
            transition: "all 0.5s ease 0.15s",
          }}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-accent">
                SkillBridge Evidence Evaluation
              </span>
              <span className="text-[10px] font-bold bg-positiveLight text-positive border border-positive/30 px-2 py-0.5 rounded-full">
                Demonstrated Capability
              </span>
            </div>

            <p className="text-xs text-inkSoft font-medium leading-relaxed">
              Adds evidence from verified resume data, projects, demonstrated skills and job-specific evaluation.
            </p>

            <div className="mt-5 pt-4 border-t border-border space-y-2.5 text-xs text-ink">
              <p className="text-[11px] font-bold uppercase tracking-wider text-accent">
                Verified Candidate Evidence:
              </p>
              <ul className="space-y-1.5 text-xs text-ink">
                <li className="flex items-center gap-2">
                  <span className="text-positive font-bold">✓</span> Skills linked to source quotes
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-positive font-bold">✓</span> Practical project deliverables & code
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-positive font-bold">✓</span> Contextual work history & continuity
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-positive font-bold">✓</span> Job-specific adaptive interview proof
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 bg-positiveLight/70 border border-positive/30 rounded-xl p-3.5 text-xs text-emerald-950 space-y-1">
            <p className="font-semibold text-positive">Transparent Candidate Dossier:</p>
            <p className="text-[11px] text-emerald-900 leading-relaxed">
              Employers review genuine demonstrated capabilities alongside clear guidance on any remaining skill gaps.
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
