import { Link } from "react-router-dom";
import { useInView } from "../../hooks/useInView";
import { useAuth } from "../../context/AuthContext";

const ForEmployers = () => {
  const [ref, inView] = useInView(0.2);
  const { user } = useAuth();
  const isCandidate = Boolean(user?.name);
  const isEmployer = Boolean(user?.companyName);

  const benefits = [
    {
      title: "Discover Overlooked Talent",
      desc: "Identify qualified candidates whose conventional resumes may undersell their capability due to career breaks, non-traditional backgrounds, or lack of recruiter target-list pedigree.",
      icon: "⚡",
    },
    {
      title: "Evidence Provenance & Audit Trails",
      desc: "Understand exactly why a candidate matches. See the verified projects, code deliverables, work experience, and job-specific interview responses backing each skill.",
      icon: "🔍",
    },
    {
      title: "Job-Specific Adaptive Evaluation",
      desc: "Conducts conversational follow-ups targeted to your exact role requirements, evaluating candidate responses in English, Hindi, and Hinglish with zero bias.",
      icon: "🤖",
    },
  ];

  return (
    <section
      id="for-employers"
      ref={ref}
      className="max-w-5xl mx-auto px-6 py-24 border-t border-border"
    >
      <div className="text-center mb-14">
        <span className="text-xs font-bold text-accent uppercase tracking-wider">
          For Forward-Thinking Employers
        </span>
        <h2 className="text-2xl md:text-3xl font-bold text-ink tracking-tight mt-1 max-w-2xl mx-auto leading-snug">
          Hire by demonstrated capability, not just static keyword history.
        </h2>
        <p className="text-sm text-inkSoft mt-3 max-w-xl mx-auto">
          Designed to reduce over-reliance on conventional resume signals by evaluating verified, evidence-backed candidate competencies.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {benefits.map((b, i) => (
          <div
            key={b.title}
            className="bg-white border border-border rounded-2xl p-6 shadow-card hover:border-accent/40 transition-all space-y-3"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(16px)",
              transition: `opacity 0.5s ease ${i * 0.12}s, transform 0.5s ease ${i * 0.12}s`,
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-accentLight text-accent flex items-center justify-center text-lg shadow-xs">
              {b.icon}
            </div>
            <h3 className="text-base font-bold text-ink">{b.title}</h3>
            <p className="text-xs text-inkSoft leading-relaxed">{b.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        {user ? (
          isEmployer ? (
            <Link
              to="/employer/dashboard"
              className="inline-block bg-accent text-white px-7 py-3 rounded-xl text-xs font-bold shadow-soft hover:bg-accent/90 hover:scale-[1.02] transition-all"
            >
              Go to Employer Pipeline →
            </Link>
          ) : (
            <Link
              to="/jobs"
              className="inline-block bg-accent text-white px-7 py-3 rounded-xl text-xs font-bold shadow-soft hover:bg-accent/90 hover:scale-[1.02] transition-all"
            >
              Browse Open Jobs →
            </Link>
          )
        ) : (
          <Link
            to="/signup?role=employer"
            className="inline-block bg-ink text-white px-7 py-3 rounded-xl text-xs font-bold shadow-soft hover:bg-ink/90 hover:scale-[1.02] transition-all"
          >
            Post a Job & View Candidate Pipelines →
          </Link>
        )}
      </div>
    </section>
  );
};

export default ForEmployers;
