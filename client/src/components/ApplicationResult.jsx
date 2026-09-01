import { useState } from "react";

const Stars = ({ rating = 5 }) => (
  <span className="text-xs text-warning">
    {"★".repeat(Math.min(5, Math.max(1, rating)))}
    {"☆".repeat(Math.max(0, 5 - Math.min(5, Math.max(1, rating))))}
  </span>
);

const ApplicationResult = ({ application }) => {
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "evidence" | "guide"

  const baseline = application?.baselineMatchScore ?? 0;
  const skillBridge = application?.matchScore ?? 0;
  const improvement = application?.improvement ?? Math.max(skillBridge - baseline, 0);

  const matchedSkills = application?.matchedSkills || [];
  const missingSkills = application?.skillsNeedingRefresh || [];
  const skillEvidence = application?.skillEvidence || [];
  const guide = application?.personalizedGuide;

  return (
    <div className="space-y-6 mt-4 animate-fadeIn">
      {/* Top Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-border pb-2 text-sm font-medium">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === "overview"
              ? "bg-accent text-white shadow-soft"
              : "text-inkSoft hover:text-ink hover:bg-ink/5"
          }`}
        >
          📊 Score Comparison
        </button>

        <button
          onClick={() => setActiveTab("evidence")}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === "evidence"
              ? "bg-accent text-white shadow-soft"
              : "text-inkSoft hover:text-ink hover:bg-ink/5"
          }`}
        >
          🔍 Demonstrated Evidence ({skillEvidence.length || matchedSkills.length})
        </button>

        {missingSkills.length > 0 && (
          <button
            onClick={() => setActiveTab("guide")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === "guide"
                ? "bg-accent text-white shadow-soft"
                : "text-inkSoft hover:text-ink hover:bg-ink/5"
            }`}
          >
            🗺️ SkillBridge Guide ({missingSkills.length})
          </button>
        )}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          {/* Side-by-side Score Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Traditional ATS Card */}
            <div className="bg-white border border-border rounded-xl p-5 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-inkSoft">
                  Traditional ATS Score
                </span>
                <span className="text-xs bg-bg border border-border px-2 py-0.5 rounded text-inkSoft">
                  Keyword Filter
                </span>
              </div>
              <p className="text-4xl font-bold text-inkSoft">{baseline}%</p>
              <p className="text-xs text-inkSoft mt-2 leading-relaxed">
                Conventional ATS primarily screens for exact title keywords and explicit resume tenure.
              </p>
            </div>

            {/* SkillBridge Card */}
            <div className="bg-white border-2 border-accent/30 rounded-xl p-5 shadow-soft relative overflow-hidden bg-gradient-to-br from-white to-accentLight/20">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-positive" />
                  SkillBridge Verified Score
                </span>
                {improvement > 0 && (
                  <span className="text-xs font-bold bg-positiveLight text-positive border border-positive/20 px-2 py-0.5 rounded-full">
                    +{improvement}% improvement
                  </span>
                )}
              </div>
              <p className="text-4xl font-bold text-positive">{skillBridge}%</p>
              <p className="text-xs text-inkSoft mt-2 leading-relaxed">
                Evaluates demonstrated practical capability from projects, experience, and adaptive skill interview.
              </p>
            </div>
          </div>

          {/* Potentially Overlooked Banner */}
          {application?.potentiallyOverlooked && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <span className="text-xl">⚡</span>
              <div>
                <p className="text-sm font-semibold text-amber-900">
                  Potentially Overlooked by Traditional Screening
                </p>
                <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                  Traditional ATS filters gave this candidate a lower score ({baseline}%), but SkillBridge uncovered strong demonstrated capability ({skillBridge}%) through verified practical evidence.
                </p>
              </div>
            </div>
          )}

          {/* Explanation Narrative */}
          {application?.explanation && (
            <div className="bg-accentLight/60 border border-accent/20 rounded-xl p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-accent mb-1.5">
                Why SkillBridge Increased Your Match
              </p>
              <p className="text-sm text-ink leading-relaxed">
                {application.explanation}
              </p>
            </div>
          )}

          {/* Matched Skills Overview */}
          <div className="bg-white border border-border rounded-xl p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-inkSoft mb-3">
              Demonstrated Skills ({matchedSkills.length})
            </p>
            {matchedSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {matchedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-positiveLight text-positive border border-positive/20 text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1.5"
                  >
                    <span>✓</span> {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-inkSoft">No matched skills identified yet.</p>
            )}
          </div>

          {/* Missing Skills Overview */}
          {missingSkills.length > 0 && (
            <div className="bg-white border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-wider text-inkSoft">
                  Skills to Strengthen ({missingSkills.length})
                </p>
                <button
                  onClick={() => setActiveTab("guide")}
                  className="text-xs text-accent font-semibold hover:underline"
                >
                  View Learning Roadmap →
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {missingSkills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-warningLight text-warning border border-warning/20 text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1"
                  >
                    <span>○</span> {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* EVIDENCE TAB */}
      {activeTab === "evidence" && (
        <div className="bg-white border border-border rounded-xl p-5 space-y-4">
          <div>
            <h3 className="text-base font-semibold text-ink">Demonstrated Skill Evidence</h3>
            <p className="text-xs text-inkSoft mt-0.5">
              Exact evidence, source tracking, and confidence levels verified by SkillBridge.
            </p>
          </div>

          <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
            {skillEvidence.length > 0 ? (
              skillEvidence.map((item, idx) => (
                <div key={idx} className="p-4 hover:bg-bg/40 transition-colors space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-ink">{item.skill}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-accentLight text-accent px-2 py-0.5 rounded-full border border-accent/15">
                        Source: {item.source?.replace("_", " ")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          item.strength === "High"
                            ? "bg-positiveLight text-positive"
                            : item.strength === "Low"
                            ? "bg-warningLight text-warning"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {item.strength || "Verified"} Strength
                      </span>
                      {item.confidence && (
                        <span className="text-[11px] text-inkSoft font-medium">
                          {Math.round(item.confidence * 100)}% conf
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-inkSoft italic bg-bg/80 p-2.5 rounded-md border border-border/60">
                    "{item.evidence}"
                  </p>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-inkSoft">
                No granular evidence items recorded. Matched skills: {matchedSkills.join(", ")}
              </div>
            )}
          </div>
        </div>
      )}

      {/* GUIDE TAB */}
      {activeTab === "guide" && (
        <div className="bg-white border border-accent/20 rounded-xl overflow-hidden shadow-soft">
          <div className="p-6 border-b border-border bg-gradient-to-r from-accentLight/30 to-white">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-accent">
                SkillBridge Guide
              </span>
              <span className="text-[10px] bg-accent text-white px-2 py-0.5 rounded-full font-semibold">
                Job-Specific Roadmap
              </span>
            </div>
            <h2 className="text-lg font-bold text-ink">
              Your Personalized Skill Development Plan
            </h2>
            <p className="text-xs text-inkSoft mt-1">
              Targeted roadmaps and curated learning resources to bridge your match gap.
            </p>
          </div>

          <div className="divide-y divide-border">
            {guide?.skillsToImprove && guide.skillsToImprove.length > 0 ? (
              guide.skillsToImprove.map((item, idx) => (
                <div key={idx} className="p-6 space-y-4">
                  {/* Skill Title & Why it matters */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-accent">PRIORITY {idx + 1}</span>
                        <h4 className="text-base font-bold text-ink">{item.skill}</h4>
                      </div>
                      <p className="text-xs text-inkSoft mt-1.5 leading-relaxed">
                        <strong>Role Requirement:</strong> {item.whyItMatters}
                      </p>
                    </div>

                    <span className="text-[11px] font-semibold bg-warningLight text-warning border border-warning/20 px-2.5 py-1 rounded-full shrink-0">
                      {item.currentStatus || "Needs improvement"}
                    </span>
                  </div>

                  {/* Step-by-Step Roadmap */}
                  {item.roadmap && item.roadmap.length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-inkSoft mb-2.5">
                        Recommended Action Steps
                      </p>
                      <div className="space-y-2">
                        {item.roadmap.map((step, sIdx) => (
                          <div
                            key={sIdx}
                            className="flex items-start gap-3 text-xs text-ink bg-bg/60 p-2.5 rounded-lg border border-border/60"
                          >
                            <span className="w-5 h-5 rounded-full bg-accent text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                              {sIdx + 1}
                            </span>
                            <span className="pt-0.5">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Curated Resources */}
                  {item.resources && item.resources.length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-inkSoft mb-2.5">
                        Ranked Learning Resources
                      </p>
                      <div className="space-y-2">
                        {item.resources.map((res, rIdx) => (
                          <div
                            key={rIdx}
                            className="flex items-center justify-between p-3 border border-border rounded-lg bg-white hover:border-accent/30 transition-colors text-xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="font-bold text-accent bg-accentLight px-2 py-0.5 rounded">
                                #{res.rank || rIdx + 1}
                              </span>
                              <div>
                                <p className="font-semibold text-ink">{res.name}</p>
                                <p className="text-[11px] text-inkSoft">{res.reason}</p>
                              </div>
                            </div>
                            <Stars rating={5 - rIdx} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested Certifications */}
                  {item.certifications && item.certifications.length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-inkSoft mb-2">
                        Recommended Industry Certification
                      </p>
                      <div className="space-y-1.5">
                        {item.certifications.map((cert, cIdx) => (
                          <div
                            key={cIdx}
                            className="p-2.5 bg-accentLight/40 border border-accent/20 rounded-lg text-xs text-ink flex items-center justify-between"
                          >
                            <span>🎓 <strong>{cert.name}</strong> ({cert.provider})</span>
                            <span className="text-[11px] text-inkSoft">{cert.reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-inkSoft">
                {missingSkills.map((sk) => (
                  <div key={sk} className="mb-2">
                    <strong>{sk}:</strong> Strengthen through hands-on project implementation and practical practice.
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationResult;
