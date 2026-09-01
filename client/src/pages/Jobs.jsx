import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/shared/Navbar";
import SkillInterview from "../components/SkillInterview";
import ApplicationResult from "../components/ApplicationResult";
import api from "../services/api";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [candidate, setCandidate] = useState(null);
  const [interviewingJobId, setInterviewingJobId] = useState(null);
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [results, setResults] = useState({}); // { jobId: applicationData }
  const [errors, setErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [pendingJobToApply, setPendingJobToApply] = useState(null); // for Confirmation Modal
  const [missingReqModal, setMissingReqModal] = useState(null); // for Mandatory Requirements Alert Modal

  useEffect(() => {
    const loadData = async () => {
      try {
        const [jobsRes, profileRes] = await Promise.all([
          api.get("/job"),
          api.get("/candidate/profile").catch(() => ({ data: null })),
        ]);
        setJobs(jobsRes.data || []);
        setCandidate(profileRes.data);
      } catch (err) {
        console.error("Failed to load jobs page:", err);
      }
    };
    loadData();
  }, []);

  // Check mandatory requirements
  const checkRequirements = () => {
    const missing = [];
    if (!candidate?.resumeText || candidate.resumeText.trim().length < 15) {
      missing.push("Resume (Upload PDF or paste text)");
    }
    if (!candidate?.workHistory || candidate.workHistory.length === 0) {
      missing.push("Work History / Experience");
    }
    if (!candidate?.projects || candidate.projects.length === 0) {
      missing.push("Practical Project (At least 1 project demonstrating skills)");
    }
    return missing;
  };

  const handleApplyInitiate = (job) => {
    const missing = checkRequirements();
    if (missing.length > 0) {
      setMissingReqModal({
        jobTitle: job.title,
        missing,
      });
      return;
    }

    // If candidate has a current gap and hasn't done interview, prompt interview
    const hasEvidence =
      (candidate?.skillEvidence && candidate.skillEvidence.length > 0) ||
      (candidate?.projects && candidate.projects.length > 0);

    const interviewNotDone =
      !candidate?.breakInterviewAnswers || candidate.breakInterviewAnswers.length === 0;

    if (candidate?.hasCareerGap && interviewNotDone && !hasEvidence) {
      setInterviewingJobId(job._id);
    } else {
      // Open confirmation modal
      setPendingJobToApply(job);
    }
  };

  const executeApply = async (jobId) => {
    setPendingJobToApply(null);
    setApplyingJobId(jobId);
    setErrors({ ...errors, [jobId]: "" });

    try {
      const { data } = await api.post("/application/apply", { jobId });
      setResults((prev) => ({ ...prev, [jobId]: data }));
    } catch (err) {
      if (err.response?.data?.requiresInterview) {
        setInterviewingJobId(jobId);
      } else if (err.response?.data?.incompleteProfile) {
        setMissingReqModal({
          jobTitle: "this role",
          missing: err.response.data.missingRequirements || [],
        });
      } else {
        setErrors((prev) => ({
          ...prev,
          [jobId]: err.response?.data?.message || "Something went wrong applying to this job.",
        }));
      }
    } finally {
      setApplyingJobId(null);
    }
  };

  const handleInterviewComplete = async (updatedCandidate) => {
    if (updatedCandidate) {
      setCandidate(updatedCandidate);
    }
    const currentJobId = interviewingJobId;
    setInterviewingJobId(null);
    if (currentJobId) {
      await executeApply(currentJobId);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      job.title?.toLowerCase().includes(q) ||
      job.company?.toLowerCase().includes(q) ||
      (job.requiredSkills || []).some((s) => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 pt-10 pb-20 space-y-6">
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-ink">Open Opportunities</h1>
              <span className="text-[11px] font-bold bg-accentLight text-accent border border-accent/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Skill-First Evaluation
              </span>
            </div>
            <p className="text-xs text-inkSoft mt-1">
              Apply with verified practical evidence. Evaluated by SkillBridge multi-agent matching.
            </p>
          </div>

          <Link
            to="/candidate/dashboard"
            className="text-xs font-bold text-accent bg-accentLight/60 border border-accent/20 px-3.5 py-2 rounded-xl hover:bg-accentLight transition-all"
          >
            ← My Profile & Dossier
          </Link>
        </div>

        {/* Search Input */}
        <div className="bg-white border border-border rounded-2xl p-2.5 shadow-xs flex items-center gap-2">
          <span className="text-inkSoft pl-2">🔍</span>
          <input
            type="text"
            placeholder="Search by role title, company, or required skill (e.g. React, REST APIs, Coordinator)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-2 py-1.5 text-xs focus:outline-none bg-transparent"
          />
        </div>

        {/* Job Cards List */}
        <div className="space-y-6">
          {filteredJobs.map((job) => {
            const isInterviewing = interviewingJobId === job._id;
            const isApplying = applyingJobId === job._id;
            const result = results[job._id];

            return (
              <div
                key={job._id}
                className="bg-white border border-border rounded-2xl p-6 shadow-card hover:border-accent/40 transition-all space-y-4 relative overflow-hidden"
              >
                {/* Top Badge & Info */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-ink">{job.title}</h3>
                    <p className="text-xs text-inkSoft mt-0.5">
                      {job.company} · {job.location || "Remote"} · {job.experienceLevel || "Mid-level"}
                    </p>
                  </div>

                  <span className="text-[11px] font-bold bg-bg border border-border px-3 py-1 rounded-full text-inkSoft">
                    {job.workMode || "Full-time"}
                  </span>
                </div>

                {/* Job Description Preview */}
                <p className="text-xs text-inkSoft leading-relaxed line-clamp-3">
                  {job.description}
                </p>

                {/* Required Skills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-xs font-semibold text-inkSoft mr-1">Required Skills:</span>
                  {job.requiredSkills?.map((s) => (
                    <span
                      key={s}
                      className="bg-accentLight text-accent text-xs font-medium px-2.5 py-0.5 rounded-full"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {/* Dynamic Interview Container */}
                {isInterviewing && (
                  <div className="mt-4 pt-4 border-t border-border animate-fadeIn">
                    <div className="bg-accentLight/60 border border-accent/25 rounded-xl p-4 mb-4 text-xs text-ink leading-relaxed">
                      💡 <strong>SkillBridge Adaptive Assessment:</strong> Demonstrating skills specifically for <strong>{job.title}</strong>. Answer in English, Hindi, or Hinglish to discover and verify your capabilities!
                    </div>
                    <SkillInterview
                      jobId={job._id}
                      onComplete={handleInterviewComplete}
                      onCancel={() => setInterviewingJobId(null)}
                    />
                  </div>
                )}

                {/* Apply Buttons */}
                {!result && !isInterviewing && (
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => handleApplyInitiate(job)}
                      disabled={isApplying}
                      className="bg-accent text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-accent/90 transition-all shadow-soft disabled:opacity-50 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {isApplying ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Evaluating Match...
                        </>
                      ) : (
                        <>Apply with SkillBridge Evidence →</>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        const missing = checkRequirements();
                        if (missing.length > 0) {
                          setMissingReqModal({ jobTitle: job.title, missing });
                        } else {
                          setInterviewingJobId(job._id);
                        }
                      }}
                      disabled={isApplying}
                      className="bg-bg border border-border text-ink hover:border-accent/40 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors"
                    >
                      Take Role-Specific AI Interview ⚡
                    </button>
                  </div>
                )}

                {/* Error Banner */}
                {errors[job._id] && (
                  <div className="bg-warningLight/50 border border-warning/30 text-warning text-xs p-3 rounded-xl mt-2">
                    {errors[job._id]}
                  </div>
                )}

                {/* Application Result Box */}
                {result && (
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-positive flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-positive animate-pulse" />
                        Application Submitted & Verified
                      </span>
                      <button
                        onClick={() => setInterviewingJobId(job._id)}
                        className="text-xs text-accent font-bold hover:underline"
                      >
                        Retake Skill Interview ↻
                      </button>
                    </div>
                    <ApplicationResult application={result} />
                  </div>
                )}
              </div>
            );
          })}

          {filteredJobs.length === 0 && (
            <div className="bg-white border border-border rounded-2xl p-12 text-center text-inkSoft">
              <p className="text-base font-semibold text-ink">No matching jobs found.</p>
              <p className="text-xs mt-1">Try searching for other role titles or skills.</p>
            </div>
          )}
        </div>

        {/* MODAL 1: MISSING MANDATORY PROFILE REQUIREMENTS */}
        {missingReqModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-fadeIn border border-amber-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <h3 className="text-base font-bold text-ink">
                      Complete Mandatory Profile First
                    </h3>
                    <p className="text-xs text-inkSoft">
                      Required before applying to {missingReqModal.jobTitle}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setMissingReqModal(null)}
                  className="text-inkSoft hover:text-ink text-sm"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-ink leading-relaxed">
                To guarantee an explainable, skill-first match, SkillBridge requires all candidates to provide basic evidence before submitting:
              </p>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-2">
                {missingReqModal.missing.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-amber-900">
                    <span>❌</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setMissingReqModal(null)}
                  className="text-xs text-inkSoft hover:text-ink px-3 py-2"
                >
                  Close
                </button>

                <Link
                  to="/candidate/dashboard"
                  className="bg-accent text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-accent/90 shadow-soft"
                >
                  Go to Profile Builder →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: CONFIRM APPLICATION MODAL */}
        {pendingJobToApply && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-fadeIn border border-border">
              <div className="flex items-start justify-between border-b border-border pb-3">
                <div>
                  <span className="text-[10px] font-bold text-accent uppercase tracking-wider">
                    Confirm Application
                  </span>
                  <h3 className="text-base font-bold text-ink mt-0.5">
                    {pendingJobToApply.title}
                  </h3>
                  <p className="text-xs text-inkSoft">
                    {pendingJobToApply.company} · {pendingJobToApply.location || "Remote"}
                  </p>
                </div>
                <button
                  onClick={() => setPendingJobToApply(null)}
                  className="text-inkSoft hover:text-ink text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-ink leading-relaxed">
                  Your application will be evaluated using your stored evidence:
                </p>
                <div className="bg-bg border border-border rounded-xl p-3 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-ink">
                    <span>📄 Resume Evidence:</span>
                    <span className="font-bold text-positive">✓ Attached</span>
                  </div>
                  <div className="flex items-center justify-between text-ink">
                    <span>🚀 Practical Projects:</span>
                    <span className="font-bold text-positive">{candidate?.projects?.length || 0} Project(s)</span>
                  </div>
                  <div className="flex items-center justify-between text-ink">
                    <span>⚡ Reusable Skills:</span>
                    <span className="font-bold text-positive">{candidate?.skillEvidence?.length || 0} Verified</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => executeApply(pendingJobToApply._id)}
                  className="w-full bg-accent text-white py-2.5 rounded-xl text-xs font-bold hover:bg-accent/90 shadow-soft hover:scale-[1.01] transition-all"
                >
                  Confirm & Submit Application →
                </button>

                <button
                  onClick={() => {
                    const jobId = pendingJobToApply._id;
                    setPendingJobToApply(null);
                    setInterviewingJobId(jobId);
                  }}
                  className="w-full bg-bg border border-border text-ink py-2 rounded-xl text-xs font-semibold hover:border-accent/40 transition-colors"
                >
                  Take Adaptive Interview First ⚡
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
