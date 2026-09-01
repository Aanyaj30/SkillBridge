import Logo from "../shared/Logo";

const Footer = () => {
  return (
    <footer className="border-t border-border py-12 bg-white">
      <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <Logo size={24} />
        <p className="text-xs text-inkSoft">
          SkillBridge — AI-Powered Skill-First Hiring Platform. Bridging demonstrated capability to real opportunity.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
