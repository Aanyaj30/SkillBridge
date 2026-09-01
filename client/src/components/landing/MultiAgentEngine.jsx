import { useInView } from "../../hooks/useInView";

const agents = [
  {
    number: "01",
    name: "Resume Evaluation Agent",
    provider: "Eden AI Parser",
    role: "Extracts structured education, experience, and certifications directly from PDF/DOCX resumes without hallucination.",
    icon: "📄",
  },
  {
    number: "02",
    name: "Job Analysis Agent",
    provider: "Skill Hierarchy Engine",
    role: "Deconstructs employer job postings into normalized required, important, and optional core competencies.",
    icon: "🎯",
  },
  {
    number: "03",
    name: "Candidate Evidence Agent",
    provider: "Provenance Verifier",
    role: "Tags every extracted skill with exact source quotes, strength levels, and repository project implementations.",
    icon: "🔍",
  },
  {
    number: "04",
    name: "Career-Gap & Interview Agent",
    provider: "Adaptive Multi-Lingual Q&A",
    role: "Conducts conversational role-specific interviews in English, Hindi, and Hinglish to discover unlisted transferable skills.",
    icon: "🤖",
  },
  {
    number: "05",
    name: "Explainable Matching Agent",
    provider: "Deterministic Scoring Engine",
    role: "Computes traditional ATS baseline vs SkillBridge match score with transparent mathematical provenance.",
    icon: "⚖️",
  },
  {
    number: "06",
    name: "Skill Guidance Agent",
    provider: "Personalized Roadmap Engine",
    role: "Provides step-by-step milestones, estimated hours, and ranked learning resources (#1, #2, #3) for genuine skill gaps.",
    icon: "🗺️",
  },
];

const MultiAgentEngine = () => {
  const [ref, inView] = useInView(0.2);

  return (
    <section
      ref={ref}
      className="max-w-5xl mx-auto px-6 py-20 border-t border-border"
    >
      <div className="text-center mb-12">
        <span className="text-xs font-bold text-accent uppercase tracking-wider">
          Multi-Agent Architecture
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight mt-1">
          Six Specialized AI Agents Working in Harmony
        </h2>
        <p className="text-xs sm:text-sm text-inkSoft mt-2 max-w-2xl mx-auto">
          Every evaluation is modular, explainable, and truthful. Designed to plug seamlessly into future enterprise AI infrastructure.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {agents.map((agent, i) => (
          <div
            key={agent.name}
            className="bg-white border border-border rounded-2xl p-6 shadow-card hover:border-accent/40 transition-all space-y-3 relative group"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(14px)",
              transition: `opacity 0.4s ease ${i * 0.08}s, transform 0.4s ease ${i * 0.08}s`,
            }}
          >
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-xl bg-accentLight text-accent flex items-center justify-center text-lg shadow-xs">
                {agent.icon}
              </span>
              <span className="text-xs font-mono font-bold text-inkSoft">
                {agent.number}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-ink group-hover:text-accent transition-colors">
                {agent.name}
              </h3>
              <p className="text-[10px] font-semibold text-accent uppercase tracking-wide mt-0.5">
                {agent.provider}
              </p>
            </div>

            <p className="text-xs text-inkSoft leading-relaxed">
              {agent.role}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default MultiAgentEngine;
