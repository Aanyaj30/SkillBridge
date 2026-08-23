import { Link } from "react-router-dom";
import { useInView } from "../../hooks/useInView";

const Hero = () => {
  const [ref, inView] = useInView(0.1);

  return (
    <section
      ref={ref}
      className="max-w-4xl mx-auto px-6 pt-24 pb-12 text-center"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
      }}
    >
      <p className="text-xs font-semibold tracking-[0.14em] text-accent uppercase mb-5">
        Rethinking the career gap
      </p>

      <h1 className="text-4xl md:text-6xl font-semibold text-ink tracking-tight leading-[1.08]">
        Your career gap is
        <br />
        not a skills gap.
      </h1>

      <p className="mt-6 text-lg text-inkSoft max-w-xl mx-auto leading-relaxed">
        SkillBridge helps candidates turn real-life experience into recognized
        professional skills — and helps employers see capability that
        traditional hiring tools filter out.
      </p>

      <div className="mt-10 flex items-center justify-center gap-4">
        <Link
          to="/signup?role=candidate"
          className="group bg-accent text-white px-6 py-3.5 rounded-md text-sm font-medium
                     shadow-soft hover:shadow-hover hover:-translate-y-0.5
                     transition-all duration-200 flex items-center gap-2"
        >
          I'm a candidate
          <span className="transition-transform duration-200 group-hover:translate-x-1">
            →
          </span>
        </Link>
        <Link
          to="/signup?role=employer"
          className="group bg-white text-ink border border-border px-6 py-3.5 rounded-md text-sm font-medium
                     hover:border-accent/40 hover:-translate-y-0.5 hover:shadow-soft
                     transition-all duration-200 flex items-center gap-2"
        >
          I'm hiring
          <span className="transition-transform duration-200 group-hover:translate-x-1">
            →
          </span>
        </Link>
      </div>
    </section>
  );
};

export default Hero;
