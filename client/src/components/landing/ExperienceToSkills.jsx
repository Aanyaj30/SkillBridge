import { useInView } from "../../hooks/useInView";

const examples = [
  {
    activity: "Managed household finances",
    skill: "Budgeting & Resource Management",
  },
  {
    activity: "Coordinated children's schedules",
    skill: "Planning & Time Management",
  },
  {
    activity: "Organized community events",
    skill: "Project Coordination & Communication",
  },
];

const ExperienceToSkills = () => {
  const [ref, inView] = useInView(0.2);

  return (
    <section
      id="for-candidates"
      ref={ref}
      className="max-w-4xl mx-auto px-6 py-24 border-t border-border"
    >
      <div className="text-center mb-14">
        <h2 className="text-2xl md:text-3xl font-semibold text-ink tracking-tight max-w-2xl mx-auto leading-snug">
          A career break tells you when someone paused.
          <br />
          It doesn't tell you what they learned.
        </h2>
      </div>

      <div className="space-y-4">
        {examples.map((ex, i) => (
          <div
            key={ex.activity}
            className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-6 bg-white border border-border rounded-lg px-6 py-5"
            style={{
              boxShadow: "var(--shadow-soft)",
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(12px)",
              transition: `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`,
            }}
          >
            <span className="text-sm text-inkSoft md:w-64 shrink-0">
              {ex.activity}
            </span>
            <span className="text-accent hidden md:inline">→</span>
            <span className="text-sm font-medium text-ink bg-accentLight px-3 py-1.5 rounded-md">
              {ex.skill}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ExperienceToSkills;
