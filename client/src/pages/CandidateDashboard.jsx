import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/shared/Navbar";
import WorkHistoryForm from "../components/WorkHistoryForm";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

// The dashboard's job now is just: capture work history, confirm it's saved.
// The skill interview no longer auto-triggers here — it gets triggered
// later, at the moment the candidate applies to a specific job (Step 8),
// since that's when a current gap actually becomes relevant. The
// SkillInterview and SkillResults components are unchanged and get reused
// as-is from inside the future "apply to job" flow.
const CandidateDashboard = () => {
  const { user } = useAuth();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount (including page refresh), load whatever profile already
  // exists in MongoDB — this is what was missing before. We only READ
  // here; we never create or overwrite the candidate document.
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/candidate/profile");
        // Only treat the profile as "saved" if work history actually exists —
        // a brand-new candidate will have an empty array, and should still
        // see the WorkHistoryForm, not a false "profile saved" state.
        if (data.workHistory && data.workHistory.length > 0) {
          setCandidate(data);
        }
      } catch (err) {
        console.error("Failed to load candidate profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleWorkHistorySaved = (data) => setCandidate(data);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg">
        <Navbar />
        <div className="max-w-xl mx-auto px-6 pt-12">
          <p className="text-sm text-inkSoft">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="max-w-xl mx-auto px-6 pt-12 pb-20">
        <h1 className="text-2xl font-semibold text-ink mb-1">
          Welcome, {user?.name}
        </h1>
        <p className="text-sm text-inkSoft mb-8">Let's build your profile.</p>

        {!candidate && <WorkHistoryForm onSaved={handleWorkHistorySaved} />}

        {candidate && (
          <div className="bg-white border border-border rounded-lg p-5">
            <p className="text-sm text-positive font-medium mb-1">
              Profile saved
            </p>
            <p className="text-sm text-inkSoft mb-5">
              {candidate.hasCareerGap
                ? `We noticed you're currently ${candidate.gapDurationMonths} months out of work. When you apply to a job, we'll ask a few quick questions to find the skills you've built since then.`
                : "You're all set. Job matching is coming soon."}
            </p>

            {/* Read-only display of what's already saved — no add/edit/delete here,
                that stays inside WorkHistoryForm, untouched. */}
            <p className="text-xs font-semibold uppercase tracking-wide text-inkSoft mb-3">
              Your work history
            </p>
            <div className="space-y-3">
              {candidate.workHistory.map((job, i) => (
                <div
                  key={i}
                  className="border-t border-border pt-3 first:border-t-0 first:pt-0"
                >
                  <p className="text-sm text-ink font-medium">{job.title}</p>
                  <p className="text-sm text-inkSoft">
                    {job.company} ·{" "}
                    {new Date(job.startDate).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                    {" – "}
                    {job.endDate
                      ? new Date(job.endDate).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })
                      : "Present"}
                  </p>
                </div>
              ))}
            </div>

            <Link
              to="/jobs"
              className="inline-block mt-5 bg-accent text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-accent/90 transition-colors shadow-soft"
            >
              Browse jobs
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateDashboard;
