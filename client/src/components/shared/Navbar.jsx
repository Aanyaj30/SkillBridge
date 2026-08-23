import { Link } from "react-router-dom";
import Logo from "./Logo";

const navLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "For candidates", href: "#for-candidates" },
  { label: "For employers", href: "#for-employers" },
];

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-bg/85 backdrop-blur-sm border-b border-border">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/">
          <Logo />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-inkSoft hover:text-ink transition-colors relative
                         after:content-[''] after:absolute after:left-0 after:-bottom-1
                         after:w-0 after:h-px after:bg-accent after:transition-all
                         hover:after:w-full"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm text-ink px-3 py-2 rounded-md hover:bg-ink/5 transition-colors"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="text-sm bg-accent text-white px-4 py-2 rounded-md font-medium
                       shadow-soft hover:shadow-hover hover:-translate-y-0.5
                       transition-all duration-200"
          >
            Get started
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
