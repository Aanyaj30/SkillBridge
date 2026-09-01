import { useState } from "react";
import { useInView } from "../../hooks/useInView";

const cohorts = [
  {
    id: "career-break",
    title: "1. Career-Break Returners",
    tag: "Flagship Hero Use Case",
    problem: "Resume timelines show employment gaps, causing conventional keyword filters to overlook qualified candidates regardless of their capabilities.",
    solution: "SkillBridge discovers transferable skills, project work, and capabilities maintained or developed during the break through project evidence and adaptive interviews.",
    signalsConventional: "Filtered out by timeline gap and static keyword screening",
    signalsSkillBridge: "Evaluated on verified projects, demonstrated skills, and contextual interview evidence",
    icon: "🌱",
  },
  {
    id: "freshers",
    title: "2. Freshers & Early Career",
    tag: "Potential Over Job Titles",
    problem: "Graduates possess high technical skills and hands-on portfolio implementations, but lack multi-year formal corporate employment titles.",
    solution: "We evaluate real project repositories, tech stack depth, and problem-solving execution rather than requiring years of title tenure.",
    signalsConventional: "Overlooked due to zero formal company tenure on traditional resumes",
    signalsSkillBridge: "Verified full-stack repository code, component architecture, and demonstrated core competencies",
    icon: "🎓",
  },
  {
    id: "tier23",
    title: "3. Tier-2 / Tier-3 College Students",
    tag: "Capability Over Pedigree",
    problem: "Institutional filters overlook extraordinary engineers simply because their university name is not on traditional recruiter target lists.",
    solution: "Objective, skill-first verification focuses on practical code execution and demonstrated capability rather than institutional pedigree.",
    signalsConventional: "Deprioritized by campus pedigree and recruiter target lists",
    signalsSkillBridge: "Evaluated on demonstrated algorithm mastery, API design, and practical application development",
    icon: "🏛️",
  },
  {
    id: "experienced",
    title: "4. Experienced Candidates",
    tag: "Modern Depth Beyond Titles",
    problem: "Senior professionals have both formal experience and new modern frameworks that might not be captured in historical job titles.",
    solution: "Harmonizes verified historical career achievements with modern demonstrated capabilities and architecture depth.",
    signalsConventional: "Assumed to only possess skills mentioned in past static titles",
    signalsSkillBridge: "Comprehensive evidence audit combining past experience with modern hands-on technical proficiencies",
    icon: "💼",
  },
  {
    id: "non-traditional",
    title: "5. Non-Traditional Candidates",
    tag: "Transferable Capabilities",
    problem: "Self-taught developers, bootcamp grads, or domain pivoters have non-linear backgrounds that traditional ATS tools misclassify.",
    solution: "Maps real-world deliverables, open source contributions, and problem-solving ability directly into required job proficiencies.",
    signalsConventional: "Misclassified due to non-linear career paths and untraditional previous titles",
    signalsSkillBridge: "Demonstrated practical API implementation, database architecture, and applied problem solving",
    icon: "🚀",
  },
];

const CandidateCohorts = () => {
  const [ref, inView] = useInView(0.2);
  const [activeTab, setActiveTab] = useState(0);
  const activeCohort = cohorts[activeTab];

  return (
    <section
      id="candidate-cohorts"
      ref={ref}
      className="max-w-5xl mx-auto px-6 py-20 border-t border-border"
    >
      <div className="text-center mb-12">
        <span className="text-xs font-bold text-accent uppercase tracking-wider">
          Inclusive Workforce Architecture
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight mt-1">
          Solving Evidence-Poor Hiring Across Every Candidate Journey
        </h2>
        <p className="text-xs sm:text-sm text-inkSoft mt-2 max-w-2xl mx-auto">
          SkillBridge is not just for one archetype. We help employers discover overlooked talent wherever conventional resume screening falls short.
        </p>
      </div>

      {/* Cohort Selector Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        {cohorts.map((cohort, idx) => (
          <button
            key={cohort.id}
            onClick={() => setActiveTab(idx)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === idx
                ? "bg-accent text-white shadow-soft scale-[1.02]"
                : "bg-white border border-border text-inkSoft hover:text-ink hover:border-accent/30"
            }`}
          >
            <span>{cohort.icon}</span>
            <span>{cohort.title.replace(/^\d+\.\s*/, "")}</span>
          </button>
        ))}
      </div>

      {/* Active Cohort Detail Card */}
      <div
        className="bg-white border border-border rounded-2xl p-8 shadow-card space-y-6 animate-fadeIn"
        style={{
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(12px)",
          transition: "all 0.4s ease",
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{activeCohort.icon}</span>
            <div>
              <h3 className="text-lg font-bold text-ink">{activeCohort.title}</h3>
              <span className="text-[10px] font-bold uppercase bg-accentLight text-accent px-2 py-0.5 rounded">
                {activeCohort.tag}
              </span>
            </div>
          </div>

          <span className="text-[10px] font-bold uppercase tracking-wider text-inkSoft bg-bg px-2.5 py-1 rounded border border-border">
            Illustrative Example
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2 bg-red-50/60 border border-red-200/60 rounded-xl p-4">
            <p className="text-xs font-bold text-red-800 uppercase tracking-wider">
              Traditional Resume Screening
            </p>
            <p className="text-xs text-ink leading-relaxed">{activeCohort.problem}</p>
            <div className="text-[11px] font-semibold text-red-700 pt-2 border-t border-red-200/40">
              Focus: {activeCohort.signalsConventional}
            </div>
          </div>

          <div className="space-y-2 bg-positiveLight/70 border border-positive/30 rounded-xl p-4">
            <p className="text-xs font-bold text-positive uppercase tracking-wider">
              SkillBridge Evidence Evaluation
            </p>
            <p className="text-xs text-ink leading-relaxed">{activeCohort.solution}</p>
            <div className="text-[11px] font-semibold text-positive pt-2 border-t border-positive/30">
              Focus: {activeCohort.signalsSkillBridge}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CandidateCohorts;
