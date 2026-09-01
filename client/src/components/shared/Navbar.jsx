import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Logo from "./Logo";
import DeleteProfileModal from "./DeleteProfileModal";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { user, authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate("/");
  };

  const handleHashNav = (hash) => {
    if (location.pathname !== "/") {
      navigate(`/${hash}`);
    } else {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = user?.name || user?.companyName;
  const isCandidate = Boolean(user?.name);
  const isEmployer = Boolean(user?.companyName);
  const userInitial = (displayName || "U").charAt(0).toUpperCase();

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-border transition-all shadow-xs">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <Link
            to={user ? (isCandidate ? "/candidate/dashboard" : "/employer/dashboard") : "/"}
            className="flex items-center gap-2 group"
          >
            <Logo />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-semibold">
            {user ? (
              <>
                {isCandidate && (
                  <>
                    <Link
                      to="/candidate/dashboard"
                      className={`transition-colors px-3 py-1.5 rounded-lg ${
                        location.pathname === "/candidate/dashboard"
                          ? "bg-accentLight text-accent font-bold"
                          : "text-inkSoft hover:text-ink"
                      }`}
                    >
                      My Profile & Evidence
                    </Link>
                    <Link
                      to="/jobs"
                      className={`transition-colors px-3 py-1.5 rounded-lg ${
                        location.pathname === "/jobs"
                          ? "bg-accentLight text-accent font-bold"
                          : "text-inkSoft hover:text-ink"
                      }`}
                    >
                      Browse Open Jobs
                    </Link>
                  </>
                )}

                {isEmployer && (
                  <>
                    <Link
                      to="/employer/dashboard"
                      className={`transition-colors px-3 py-1.5 rounded-lg ${
                        location.pathname === "/employer/dashboard"
                          ? "bg-accentLight text-accent font-bold"
                          : "text-inkSoft hover:text-ink"
                      }`}
                    >
                      Employer Pipeline
                    </Link>
                    <Link
                      to="/post-job"
                      className={`transition-colors px-3 py-1.5 rounded-lg ${
                        location.pathname === "/post-job"
                          ? "bg-accentLight text-accent font-bold"
                          : "text-inkSoft hover:text-ink"
                      }`}
                    >
                      + Post a Job
                    </Link>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => handleHashNav("#how-it-works")}
                  className="text-inkSoft hover:text-ink transition-colors px-2 py-1"
                >
                  How it works
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleHashNav("#how-it-works")}
                  className="text-inkSoft hover:text-ink transition-colors"
                >
                  How it works
                </button>
                <button
                  type="button"
                  onClick={() => handleHashNav("#candidate-cohorts")}
                  className="text-inkSoft hover:text-ink transition-colors"
                >
                  Who it's for
                </button>
                <button
                  type="button"
                  onClick={() => handleHashNav("#for-employers")}
                  className="text-inkSoft hover:text-ink transition-colors"
                >
                  For employers
                </button>
              </>
            )}
          </div>

          {/* Right Auth / Profile Menu */}
          <div className="flex items-center gap-3">
            {authLoading ? null : user ? (
              <div className="relative" ref={dropdownRef}>
                {/* Profile Icon Button */}
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2.5 bg-bg hover:bg-ink/5 border border-border px-3 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-accent text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {userInitial}
                  </div>
                  <div className="text-left hidden sm:block">
                    <span className="text-xs font-bold text-ink block leading-tight max-w-[120px] truncate">
                      {displayName}
                    </span>
                    <span className="text-[10px] font-semibold text-accent uppercase tracking-wider block">
                      {isCandidate ? "Candidate" : "Employer"}
                    </span>
                  </div>
                  <span className="text-inkSoft text-xs">▾</span>
                </button>

                {/* Profile Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-border rounded-2xl shadow-xl py-2 z-50 animate-fadeIn">
                    <div className="px-4 py-2.5 border-b border-border/80">
                      <p className="text-xs font-bold text-ink truncate">{displayName}</p>
                      <p className="text-[11px] text-inkSoft truncate">{user?.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold uppercase bg-accentLight text-accent px-2 py-0.5 rounded">
                        {isCandidate ? "Verified Candidate" : "Employer Account"}
                      </span>
                    </div>

                    <div className="py-1 text-xs">
                      {isCandidate ? (
                        <>
                          <Link
                            to="/candidate/dashboard"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-ink hover:bg-bg transition-colors"
                          >
                            <span>👤</span> My Profile & Evidence
                          </Link>
                          <Link
                            to="/jobs"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-ink hover:bg-bg transition-colors"
                          >
                            <span>💼</span> Browse Open Jobs
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            to="/employer/dashboard"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-ink hover:bg-bg transition-colors"
                          >
                            <span>📊</span> Candidate Pipeline
                          </Link>
                          <Link
                            to="/post-job"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-ink hover:bg-bg transition-colors"
                          >
                            <span>➕</span> Post a Job
                          </Link>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          setDeleteModalOpen(true);
                        }}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors font-medium"
                      >
                        <span>🗑️</span> Delete Profile & Data
                      </button>
                    </div>

                    <div className="pt-1 border-t border-border/80">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-semibold text-inkSoft hover:text-ink hover:bg-bg transition-colors"
                      >
                        <span>🚪</span> Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs font-semibold text-ink px-3 py-2 rounded-xl hover:bg-ink/5 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="text-xs font-bold bg-accent text-white px-4 py-2 rounded-xl shadow-soft hover:bg-accent/90 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Get started →
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Delete Profile Modal */}
      <DeleteProfileModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
