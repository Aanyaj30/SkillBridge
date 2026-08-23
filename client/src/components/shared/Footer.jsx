import Logo from "../shared/Logo";

const Footer = () => {
  return (
    <footer id="for-employers" className="border-t border-border py-12">
      <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <Logo size={24} />
        <p className="text-sm text-inkSoft">
          Bridging real experience to real opportunity.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
