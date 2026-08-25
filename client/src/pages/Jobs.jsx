import { useState, useEffect } from "react";
import Navbar from "../components/shared/Navbar";
import SkillInterview from "../components/SkillInterview";
import ApplicationResult from "../components/ApplicationResult";
import api from "../services/api";

// This is the real trigger point we designed: applying to a job checks
// whether the candidate is in a current gap and hasn't extracted skills
// yet — if so, the interview runs first, THEN the application completes.
const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [candidate, setCandidate] = useState(null);
  const [interviewingJobId, setInterviewingJobId] = useState(null);
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [results, setResults] = useState({}); // { jobId: applicationData }
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const load = async () => {
      const [jobsRes, profileRes] = await Promise.all([
        api.get("/job"),
        api.get("/candidate/profile"),
      ]);
      setJobs(jobsRes.data);
      setCandidate(profileRes.data);
    };
    load();
  }, []);

  const submitApplication = async (jobId) => {
    setApplyingJobId(jobId);
    setErrors({ ...errors, [jobId]: "" });
    try {
      const { data } = await api.post("/application/apply", { jobId });
      setResults({ ...results, [jobId]: data });
    } catch (err) {
      if (err.response?.data?.requiresInterview) {
        setInterviewingJobId(jobId);
      } else {
        setErrors({
          ...errors,
          [jobId]: err.response?.data?.message || "Something went wrong",
        });
      }
    } finally {
      setApplyingJobId(null);
    }
  };

  const handleApplyClick = (jobId) => {
    const interviewNotDone =
      !candidate.extractedSkills || candidate.extractedSkills.length === 0;
    if (candidate.hasCareerGap && interviewNotDone) {
      setInterviewingJobId(jobId);
    } else {
      submitApplication(jobId);
    }
  };

  const handleInterviewComplete = async () => {
    // Interview answers are saved; now extract skills, then finish applying
    const { data } = await api.post("/candidate/extract-skills");
    setCandidate(data);
    const jobId = interviewingJobId;
    setInterviewingJobId(null);
    await submitApplication(jobId);
  };

  if (!candidate) {
    return (
      <div className="min-h-screen bg-bg">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 pt-12">
          <p className="text-sm text-inkSoft">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 pt-12 pb-20">
        <h1 className="text-2xl font-semibold text-ink mb-1">Open roles</h1>
        <p className="text-sm text-inkSoft mb-8">
          Find a role that matches your real skills.
        </p>

        <div className="space-y-6">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="bg-white border border-border rounded-lg p-6"
            >
              <p className="text-base font-semibold text-ink">{job.title}</p>
              <p className="text-sm text-inkSoft mb-3">{job.company}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {job.requiredSkills.map((s) => (
                  <span
                    key={s}
                    className="bg-accentLight text-accent text-xs font-medium px-2.5 py-1 rounded-full"
                  >
                    {s}
                  </span>
                ))}
              </div>

              {interviewingJobId === job._id && (
                <div className="mb-4">
                  <div className="bg-accentLight border border-accent/20 rounded-lg p-4 mb-4 text-sm text-ink">
                    We noticed a career gap. A few quick questions will help us
                    find the skills you've built since then, before we complete
                    this application.
                  </div>
                  <SkillInterview onComplete={handleInterviewComplete} />
                </div>
              )}

              {!results[job._id] && interviewingJobId !== job._id && (
                <button
                  onClick={() => handleApplyClick(job._id)}
                  disabled={applyingJobId === job._id}
                  className="bg-accent text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-accent/90 transition-colors shadow-soft disabled:opacity-60"
                >
                  {applyingJobId === job._id ? "Applying..." : "Apply"}
                </button>
              )}

              {errors[job._id] && (
                <p className="text-sm text-warning mt-2">{errors[job._id]}</p>
              )}

              {results[job._id] && (
                <ApplicationResult application={results[job._id]} />
              )}
            </div>
          ))}

          {jobs.length === 0 && (
            <p className="text-sm text-inkSoft">No jobs posted yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Jobs;
