import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/shared/Navbar";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const EmployerDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/job/my");
        setJobs(data || []);
      } catch (err) {
        console.error("Failed to load employer jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 pt-10 pb-20 space-y-6">
        <div className="bg-white border border-border rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-ink">
                {user?.companyName || "Employer Dashboard"}
              </h1>
              <span className="text-xs bg-accentLight text-accent border border-accent/20 px-2.5 py-0.5 rounded-full font-semibold">
                Employer Hub
              </span>
            </div>
            <p className="text-xs text-inkSoft mt-1">
              Manage your skill-first job postings and discover overlooked talent pipelines.
            </p>
          </div>

          <Link
            to="/post-job"
            className="bg-accent text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-accent/90 transition-all shadow-soft shrink-0"
          >
            + Post a Job
          </Link>
        </div>

        {loading && (
          <div className="text-center py-10">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full mb-3" />
            <p className="text-xs text-inkSoft">Loading your posted roles...</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
              Your Active Job Postings ({jobs.length})
            </h2>
          </div>

          {jobs.map((job) => (
            <Link
              key={job._id}
              to={`/employer/job/${job._id}/pipeline`}
              className="block bg-white border border-border rounded-2xl p-6 shadow-card hover:border-accent/40 transition-all space-y-3 group"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-ink group-hover:text-accent transition-colors">
                    {job.title}
                  </h3>
                  <p className="text-xs text-inkSoft mt-0.5">
                    {job.location || "Remote"} · {job.workMode || "Full-time"} · {job.experienceLevel || "Mid-level"}
                  </p>
                </div>

                <span className="bg-accentLight text-accent text-xs font-semibold px-3 py-1 rounded-lg group-hover:bg-accent group-hover:text-white transition-all shadow-xs">
                  View Candidate Pipeline →
                </span>
              </div>

              {job.requiredSkills && job.requiredSkills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {job.requiredSkills.map((s) => (
                    <span
                      key={s}
                      className="bg-bg text-inkSoft border border-border text-[11px] font-medium px-2.5 py-0.5 rounded-full"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}

          {!loading && jobs.length === 0 && (
            <div className="bg-white border border-border rounded-2xl p-12 text-center text-inkSoft space-y-3">
              <p className="text-base font-semibold text-ink">You haven't posted any jobs yet.</p>
              <p className="text-xs">Create your first role to start discovering candidate talent with SkillBridge.</p>
              <Link
                to="/post-job"
                className="inline-block bg-accent text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-accent/90"
              >
                Post Your First Job
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;
