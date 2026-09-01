import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/shared/Navbar";
import api from "../services/api";

const isOverlooked = (app) =>
  app.potentiallyOverlooked ||
  (app.baselineMatchScore < 50 && app.matchScore >= 50) ||
  (app.matchScore - app.baselineMatchScore >= 20 && app.matchScore >= 55);

const CandidatePipeline = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null); // for "View Why" modal

  useEffect(() => {
    const load = async () => {
      try {
        const [jobRes, appsRes] = await Promise.all([
          api.get(`/job/${jobId}`),
          api.get(`/application/job/${jobId}`),
        ]);
        setJob(jobRes.data);
        setApplications(appsRes.data || []);
      } catch (err) {
        console.error("Failed to load candidate pipeline:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [jobId]);

  const overlookedCount = applications.filter(isOverlooked).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-bg">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 pt-12 text-center">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full mb-3" />
          <p className="text-sm text-inkSoft">Loading candidate pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 pt-12 pb-20">
        <Link
          to="/employer/dashboard"
          className="text-sm text-accent hover:underline inline-flex items-center gap-1 mb-3"
        >
          ← Back to posted jobs
        </Link>

        {/* Job Header */}
        <div className="bg-white border border-border rounded-xl p-6 mb-6 shadow-xs">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-accent uppercase tracking-wider">
                Candidate Pipeline
              </span>
              <h1 className="text-2xl font-bold text-ink mt-0.5">{job?.title}</h1>
              <p className="text-xs text-inkSoft mt-1">
                {job?.company} · {job?.location || "Remote"} · {job?.experienceLevel || "Mid-level"}
              </p>
            </div>

            <div className="text-right">
              <span className="text-2xl font-bold text-ink">{applications.length}</span>
              <p className="text-xs text-inkSoft">Total Applicants</p>
            </div>
          </div>

          {/* Job Required Skills */}
          {job?.requiredSkills && job.requiredSkills.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-inkSoft font-medium mr-1">Required Skills:</span>
              {job.requiredSkills.map((s) => (
                <span
                  key={s}
                  className="bg-accentLight text-accent text-xs font-medium px-2.5 py-0.5 rounded-full"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Overlooked Talent Banner */}
        {overlookedCount > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-6 shadow-xs flex items-start gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <p className="text-sm font-bold text-amber-900">
                {overlookedCount} Potentially Overlooked Candidate{overlookedCount > 1 ? "s" : ""} Discovered
              </p>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                Traditional keyword ATS screening rated these candidates below threshold, but SkillBridge discovered strong hands-on capabilities through projects, non-traditional experience, and verified adaptive interviews.
              </p>
            </div>
          </div>
        )}

        {/* Candidate List */}
        <div className="space-y-4">
          {applications.map((app) => {
            const overlooked = isOverlooked(app);
            const baseline = app.baselineMatchScore ?? 0;
            const score = app.matchScore ?? 0;
            const diff = Math.max(score - baseline, 0);

            return (
              <div
                key={app._id}
                className="bg-white border border-border rounded-xl p-6 shadow-card hover:border-accent/30 transition-all space-y-4"
              >
                {/* Top Row: Info & Scores */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-lg font-bold text-ink">{app.candidate?.name}</h3>
                      {overlooked && (
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          ⚡ Potentially Overlooked
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-inkSoft mt-0.5">{app.candidate?.email}</p>

                    {/* Profile Links */}
                    {app.candidate?.profileLinks && (
                      <div className="flex items-center gap-3 mt-2 text-xs text-accent">
                        {app.candidate.profileLinks.github && (
                          <a
                            href={app.candidate.profileLinks.github}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline"
                          >
                            GitHub ↗
                          </a>
                        )}
                        {app.candidate.profileLinks.linkedin && (
                          <a
                            href={app.candidate.profileLinks.linkedin}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline"
                          >
                            LinkedIn ↗
                          </a>
                        )}
                        {app.candidate.profileLinks.portfolio && (
                          <a
                            href={app.candidate.profileLinks.portfolio}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline"
                          >
                            Portfolio ↗
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Score Comparison Box */}
                  <div className="flex items-center gap-4 bg-bg p-3 rounded-xl border border-border">
                    <div className="text-center px-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-inkSoft">
                        Old ATS
                      </p>
                      <p className="text-xl font-bold text-inkSoft">{baseline}%</p>
                    </div>

                    <div className="text-xs font-bold text-accent">→</div>

                    <div className="text-center px-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-positive">
                        SkillBridge
                      </p>
                      <p className="text-2xl font-bold text-positive">{score}%</p>
                    </div>

                    {diff > 0 && (
                      <div className="bg-positiveLight text-positive border border-positive/20 px-2 py-1 rounded-lg text-xs font-bold">
                        +{diff}%
                      </div>
                    )}
                  </div>
                </div>

                {/* Skills Pills */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-semibold text-inkSoft mr-1">Matched:</span>
                    {app.matchedSkills?.map((s) => (
                      <span
                        key={s}
                        className="bg-positiveLight text-positive border border-positive/20 text-xs font-medium px-2.5 py-0.5 rounded-full"
                      >
                        ✓ {s}
                      </span>
                    ))}
                    {(!app.matchedSkills || app.matchedSkills.length === 0) && (
                      <span className="text-xs text-inkSoft italic">None demonstrated</span>
                    )}
                  </div>

                  {app.skillsNeedingRefresh?.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-semibold text-inkSoft mr-1">Missing:</span>
                      {app.skillsNeedingRefresh.map((s) => (
                        <span
                          key={s}
                          className="bg-warningLight text-warning border border-warning/20 text-xs font-medium px-2 py-0.5 rounded-full"
                        >
                          ○ {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-inkSoft">
                    {app.skillEvidence?.length || 0} verified evidence points recorded
                  </p>

                  <button
                    onClick={() => setSelectedApp(app)}
                    className="bg-accent text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-accent/90 transition-colors shadow-soft"
                  >
                    View Why & Evidence Breakdown →
                  </button>
                </div>
              </div>
            );
          })}

          {applications.length === 0 && (
            <div className="bg-white border border-border rounded-xl p-12 text-center text-inkSoft">
              <p className="text-base font-semibold text-ink">No candidate applications yet.</p>
              <p className="text-xs mt-1">Candidates applying to this job will be evaluated here.</p>
            </div>
          )}
        </div>

        {/* DETAILED EVIDENCE MODAL ("View Why") */}
        {selectedApp && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl space-y-6 animate-fadeIn">
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-accent uppercase tracking-wider">
                      SkillBridge Candidate Evidence Dossier
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-ink mt-0.5">
                    {selectedApp.candidate?.name}
                  </h2>
                  <p className="text-xs text-inkSoft">
                    Applicant for: <strong>{job?.title}</strong>
                  </p>
                </div>

                <button
                  onClick={() => setSelectedApp(null)}
                  className="text-inkSoft hover:text-ink w-8 h-8 flex items-center justify-center rounded-full hover:bg-bg text-base"
                >
                  ✕
                </button>
              </div>

              {/* Before vs After Comparison Card */}
              <div className="bg-gradient-to-r from-accentLight/40 to-positiveLight/40 border border-accent/20 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-inkSoft uppercase tracking-wider">
                    Screening Outcome
                  </p>
                  <p className="text-xs text-inkSoft mt-1">
                    Traditional ATS: <strong className="text-ink">{selectedApp.baselineMatchScore}%</strong>
                    {"  "}→ SkillBridge: <strong className="text-positive">{selectedApp.matchScore}%</strong>
                  </p>
                </div>

                <span className="text-sm font-bold bg-white text-positive border border-positive/30 px-3 py-1 rounded-full shadow-xs">
                  +{Math.max(selectedApp.matchScore - selectedApp.baselineMatchScore, 0)}% Increased Match
                </span>
              </div>

              {/* Why SkillBridge considers candidate stronger */}
              {selectedApp.explanation && (
                <div className="bg-bg border border-border rounded-xl p-4 space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-accent">
                    Why SkillBridge Verified This Candidate
                  </p>
                  <p className="text-xs text-ink leading-relaxed">
                    {selectedApp.explanation}
                  </p>
                </div>
              )}

              {/* Evidence Items Breakdown */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-ink">
                  Verified Skill Evidence ({selectedApp.skillEvidence?.length || 0})
                </h4>

                <div className="space-y-2.5">
                  {selectedApp.skillEvidence?.map((ev, i) => (
                    <div
                      key={i}
                      className="border border-border rounded-xl p-3.5 bg-white space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-ink">{ev.skill}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-accentLight text-accent px-2 py-0.5 rounded-full">
                            Source: {ev.source?.replace("_", " ")}
                          </span>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            ev.strength === "High"
                              ? "bg-positiveLight text-positive"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {ev.strength || "Verified"} Strength
                        </span>
                      </div>

                      <p className="text-xs text-inkSoft italic bg-bg/80 p-2 rounded-lg border border-border/60">
                        "{ev.evidence}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interview Q&A Transcript */}
              {selectedApp.interviewAnswers && selectedApp.interviewAnswers.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-border">
                  <h4 className="text-sm font-bold text-ink">
                    Adaptive Skill Interview Transcript ({selectedApp.interviewAnswers.length} questions)
                  </h4>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {selectedApp.interviewAnswers.map((qa, i) => (
                      <div key={i} className="bg-bg/80 border border-border rounded-xl p-3 text-xs space-y-1.5">
                        <p className="font-semibold text-accent">
                          Q{i + 1} ({qa.targetSkill || "Target Skill"}): {qa.question}
                        </p>
                        <p className="text-ink bg-white p-2 rounded-lg border border-border/60">
                          {qa.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div className="text-right pt-2">
                <button
                  onClick={() => setSelectedApp(null)}
                  className="bg-ink text-white px-5 py-2 rounded-lg text-xs font-medium hover:bg-ink/90 transition-colors"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidatePipeline;
