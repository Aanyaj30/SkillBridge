import { useState } from "react";
import Navbar from "../components/shared/Navbar";
import api from "../services/api";

const PostJob = () => {
  const [form, setForm] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [postedJob, setPostedJob] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/job", form);
      setPostedJob(data);
      setForm({ title: "", description: "" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="max-w-lg mx-auto px-6 pt-12 pb-20">
        <h1 className="text-2xl font-semibold text-ink mb-1">Post a job</h1>
        <p className="text-sm text-inkSoft mb-8">
          We'll automatically identify the skills this role requires.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            placeholder="Job title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            className="w-full border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
          />
          <textarea
            placeholder="Job description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
            rows={6}
            className="w-full border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-accent resize-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-white py-2.5 rounded-md text-sm font-medium hover:bg-accent/90 transition-colors shadow-soft disabled:opacity-60"
          >
            {loading ? "Analyzing description..." : "Post job"}
          </button>
        </form>

        {postedJob && (
          <div className="mt-6 bg-white border border-accent/25 rounded-lg p-5">
            <p className="text-sm text-positive font-medium mb-3">
              "{postedJob.title}" posted
            </p>
            <p className="text-xs font-semibold uppercase tracking-wide text-inkSoft mb-2">
              Required skills identified
            </p>
            <div className="flex flex-wrap gap-2">
              {postedJob.requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="bg-accentLight text-accent text-xs font-medium px-3 py-1.5 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostJob;
