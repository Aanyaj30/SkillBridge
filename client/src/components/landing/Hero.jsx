import { Link } from "react-router-dom";
import { useInView } from "../../hooks/useInView";

const Hero = () => {
  const [ref, inView] = useInView(0.1);

  return (
    <section
      ref={ref}
      className="max-w-5xl mx-auto px-6 pt-20 pb-14 text-center relative"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
      }}
    >
      {/* Category Pill */}
      <div className="inline-flex items-center gap-2 bg-accentLight border border-accent/20 px-3.5 py-1.5 rounded-full text-xs font-bold text-accent mb-6 shadow-xs">
        <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        AI-Powered Skill-First Hiring Platform
      </div>

      {/* Primary Tagline */}
      <h1 className="text-4xl sm:text-6xl font-bold text-ink tracking-tight leading-[1.12]">
        The Gap Changed.
        <br />
        <span className="bg-gradient-to-r from-accent via-emerald-600 to-teal-700 bg-clip-text text-transparent">
          The Talent Didn't.
        </span>
      </h1>

      {/* Core Positioning Statement */}
      <p className="mt-6 text-base sm:text-lg text-inkSoft max-w-2xl mx-auto leading-relaxed font-normal">
        SkillBridge helps employers discover candidates based on <strong>demonstrated skills and practical potential</strong> — not just traditional resume keyword history.
      </p>

      {/* Primary CTA Buttons */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/signup?role=candidate"
          className="group bg-accent text-white px-7 py-3.5 rounded-xl text-xs font-bold
                     shadow-soft hover:bg-accent/90 hover:-translate-y-0.5 hover:shadow-card
                     transition-all duration-200 flex items-center gap-2"
        >
          I'm a Candidate
          <span className="transition-transform duration-200 group-hover:translate-x-1">
            →
          </span>
        </Link>
        <Link
          to="/signup?role=employer"
          className="group bg-white text-ink border border-border px-7 py-3.5 rounded-xl text-xs font-bold
                     hover:border-accent/40 hover:-translate-y-0.5 hover:shadow-soft
                     transition-all duration-200 flex items-center gap-2"
        >
          I'm Hiring
          <span className="transition-transform duration-200 group-hover:translate-x-1">
            →
          </span>
        </Link>
      </div>

      {/* Micro Metrics Strip */}
      <div className="mt-14 pt-10 border-t border-border/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-left max-w-4xl mx-auto">
        <div className="space-y-1">
          <p className="text-2xl font-bold text-ink">100%</p>
          <p className="text-xs text-inkSoft">Evidence-Grounded (Zero Fabrication)</p>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-accent">5 Cohorts</p>
          <p className="text-xs text-inkSoft">Inclusive Workforce Architecture</p>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-positive">Dynamic</p>
          <p className="text-xs text-inkSoft">Adaptive Hinglish & English Q&A</p>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-ink">Explainable</p>
          <p className="text-xs text-inkSoft">Transparent Before vs After Match</p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
