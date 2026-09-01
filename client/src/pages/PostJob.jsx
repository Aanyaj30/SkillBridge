import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/shared/Navbar";
import api from "../services/api";

const PostJob = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "Remote / Flexible",
    workMode: "Full-time",
    experienceLevel: "Mid-level",
  });
  const [loading, setLoading] = useState(false);
  const [postedJob, setPostedJob] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/job", form);
      setPostedJob(data);
      setForm({
        title: "",
        description: "",
        location: "Remote / Flexible",
        workMode: "Full-time",
        experienceLevel: "Mid-level",
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Something went wrong posting this job."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="max-w-xl mx-auto px-6 pt-10 pb-20 space-y-6">
        <div>
          <Link
            to="/employer/dashboard"
            className="text-xs text-accent hover:underline inline-flex items-center gap-1 mb-2"
          >
            ← Back to Employer Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-ink">Post a New Opportunity</h1>
          <p className="text-xs text-inkSoft mt-1">
            Our Job Analysis Agent will automatically structure required, critical, and optional skills.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-border rounded-2xl p-6 shadow-card space-y-4">
          <div>
            <label className="text-xs font-bold text-inkSoft uppercase tracking-wider">Job Title</label>
            <input
              placeholder="e.g. Frontend Developer, Project Coordinator"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="w-full border border-border rounded-lg px-3.5 py-2.5 text-xs focus:outline-none focus:border-accent mt-1"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-inkSoft uppercase tracking-wider">Experience</label>
              <select
                value={form.experienceLevel}
                onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}
                className="w-full border border-border rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:border-accent mt-1 bg-white"
              >
                <option value="Entry-level">Entry-level</option>
                <option value="Mid-level">Mid-level</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-inkSoft uppercase tracking-wider">Work Mode</label>
              <select
                value={form.workMode}
                onChange={(e) => setForm({ ...form, workMode: e.target.value })}
                className="w-full border border-border rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:border-accent mt-1 bg-white"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-inkSoft uppercase tracking-wider">Location</label>
              <input
                placeholder="e.g. Remote, Mumbai"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full border border-border rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:border-accent mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-inkSoft uppercase tracking-wider">Job Description</label>
            <textarea
              placeholder="Paste the full job description. Detail the key responsibilities, tech stack, and goals..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              rows={7}
              className="w-full border border-border rounded-lg p-3 text-xs focus:outline-none focus:border-accent resize-none mt-1 leading-relaxed"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-white py-3 rounded-xl text-xs font-bold hover:bg-accent/90 transition-all shadow-soft disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Job Analysis Agent is extracting skills...
              </>
            ) : (
              <>Analyze & Post Job →</>
            )}
          </button>
        </form>

        {error && (
          <div className="bg-warningLight/50 border border-warning/30 text-warning text-xs p-3 rounded-xl">
            {error}
          </div>
        )}

        {/* AI Skill Extraction Results */}
        {postedJob && (
          <div className="bg-white border-2 border-positive/30 rounded-2xl p-6 shadow-soft space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-positive uppercase tracking-wider">
                  ✓ Job Posted & Structured
                </span>
                <h3 className="text-base font-bold text-ink">{postedJob.title}</h3>
              </div>
              <Link
                to={`/employer/job/${postedJob._id}/pipeline`}
                className="bg-accent text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-accent/90"
              >
                View Pipeline →
              </Link>
            </div>

            {/* Required Skills */}
            <div className="space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-wider text-inkSoft">
                Required Skills Extracted ({postedJob.requiredSkills?.length || 0})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {postedJob.requiredSkills?.map((skill) => (
                  <span
                    key={skill}
                    className="bg-accentLight text-accent text-xs font-medium px-3 py-1 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Important / Core Skills */}
            {postedJob.importantSkills?.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-inkSoft">
                  Core Critical Competencies
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {postedJob.importantSkills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-positiveLight text-positive border border-positive/20 text-xs font-medium px-3 py-1 rounded-full"
                    >
                      ★ {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Optional Skills */}
            {postedJob.optionalSkills?.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-inkSoft">
                  Optional / Nice to have
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {postedJob.optionalSkills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-bg text-inkSoft text-xs font-medium px-2.5 py-0.5 rounded-full border border-border"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostJob;
