import { useInView } from "../../hooks/useInView";

const agents = [
  {
    number: "01",
    name: "Resume Evaluation Agent",
    provider: "Eden AI Resume Parsing",
    role: "Extracts structured candidate information from the uploaded resume through the resume parsing layer.",
    icon: "📄",
  },
  {
    number: "02",
    name: "Job Analysis Agent",
    provider: "Job Requirements Layer",
    role: "Analyzes job requirements and identifies relevant skills and requirements.",
    icon: "🎯",
  },
  {
    number: "03",
    name: "Candidate Evidence Agent",
    provider: "Evidence Provenance Verifier",
    role: "Connects candidate skills to available evidence from resumes, projects, certifications and other submitted information.",
    icon: "🔍",
  },
  {
    number: "04",
    name: "Career-Gap / Adaptive Interview Agent",
    provider: "Contextual Q&A",
    role: "When additional evidence is needed, conducts job-relevant follow-up questions, with career-gap recovery as an important use case.",
    icon: "🤖",
  },
  {
    number: "05",
    name: "Explainable Matching Agent",
    provider: "Evidence Matching Engine",
    role: "Calculates job-specific matching using the candidate evidence and required skills.",
    icon: "⚖️",
  },
  {
    number: "06",
    name: "Skill Guidance Agent",
    provider: "Personalized Guidance",
    role: "Generates personalized guidance for genuine skill gaps.",
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
          Every evaluation is modular, explainable, and grounded in submitted candidate evidence.
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
