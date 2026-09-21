import { useState } from "react";

const Stars = ({ rating = 5 }) => (
  <span className="text-xs text-warning">
    {"★".repeat(Math.min(5, Math.max(1, rating)))}
    {"☆".repeat(Math.max(0, 5 - Math.min(5, Math.max(1, rating))))}
  </span>
);

const ApplicationResult = ({ application }) => {
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "evidence" | "guide"
  const [showAtsMath, setShowAtsMath] = useState(false);
  const [showSbMath, setShowSbMath] = useState(false);

  const baseline = application?.baselineMatchScore ?? 0;
  const skillBridge = application?.matchScore ?? 0;
  const improvement = application?.improvement ?? Math.max(skillBridge - baseline, 0);

  const matchedSkills = application?.matchedSkills || [];
  const missingSkills = application?.skillsNeedingRefresh || [];
  const skillEvidence = application?.skillEvidence || [];
  const guide = application?.personalizedGuide;

  const baselineBreakdown = application?.baselineBreakdown || {};
  const matchBreakdown = application?.matchBreakdown || {};

  return (
    <div className="space-y-6 mt-4 animate-fadeIn">
      {/* Top Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-border pb-2 text-sm font-medium">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === "overview"
              ? "bg-accent text-white shadow-soft font-bold"
              : "text-inkSoft hover:text-ink hover:bg-ink/5"
          }`}
        >
          📊 Score Comparison
        </button>

        <button
          onClick={() => setActiveTab("evidence")}
          className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === "evidence"
              ? "bg-accent text-white shadow-soft font-bold"
              : "text-inkSoft hover:text-ink hover:bg-ink/5"
          }`}
        >
          🔍 Demonstrated Evidence ({skillEvidence.length || matchedSkills.length})
        </button>

        {missingSkills.length > 0 && (
          <button
            onClick={() => setActiveTab("guide")}
            className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === "guide"
                ? "bg-accent text-white shadow-soft font-bold"
                : "text-inkSoft hover:text-ink hover:bg-ink/5"
            }`}
          >
            🗺️ SkillBridge Guide ({missingSkills.length})
          </button>
        )}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-5">
          {/* Side-by-side Score Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Traditional ATS Card */}
            <div className="bg-white border border-border rounded-xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-inkSoft">
                    Traditional ATS Score
                  </span>
                  <span className="text-xs bg-bg border border-border px-2 py-0.5 rounded text-inkSoft font-medium">
                    Keyword Filter
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-inkSoft">{baseline}%</p>
                  <span className="text-xs text-inkSoft font-medium">/ 100 max</span>
                </div>
                <p className="text-xs text-inkSoft mt-2 leading-relaxed">
                  Evaluates conventional resume screening: title exact match, experience tenure, CS degree keywords, and verbatim resume text hits.
                </p>
              </div>

              {/* ATS Mathematical Breakdown */}
              <div className="mt-4 pt-3 border-t border-border/80">
                <button
                  type="button"
                  onClick={() => setShowAtsMath(!showAtsMath)}
                  className="text-xs font-semibold text-accent hover:underline flex items-center justify-between w-full cursor-pointer"
                >
                  <span>{showAtsMath ? "▲ Hide Formula Breakdown" : "▼ Show Exact Formula & Math"}</span>
                  <span className="text-[11px] text-inkSoft font-mono">
                    {baselineBreakdown.roleTitle?.score ?? (baseline >= 30 ? 30 : 0)} +{" "}
                    {baselineBreakdown.experience?.score ?? (baseline >= 20 ? 15 : 0)} +{" "}
                    {baselineBreakdown.education?.score ?? (baseline >= 20 ? 20 : 0)} +{" "}
                    {baselineBreakdown.keywords?.score ?? 0} = {baseline}%
                  </span>
                </button>

                {showAtsMath && (
                  <div className="mt-3 space-y-2 bg-bg/80 p-3 rounded-lg border border-border text-xs text-ink animate-fadeIn font-mono">
                    <div className="flex justify-between">
                      <span>• Role Title Alignment:</span>
                      <span className="font-semibold">{baselineBreakdown.roleTitle?.score ?? 0} / 30 pts</span>
                    </div>
                    {baselineBreakdown.roleTitle?.detail && (
                      <p className="text-[10px] text-inkSoft pl-3 font-sans">{baselineBreakdown.roleTitle.detail}</p>
                    )}

                    <div className="flex justify-between">
                      <span>• Experience & Continuity:</span>
                      <span className="font-semibold">{baselineBreakdown.experience?.score ?? 0} / 25 pts</span>
                    </div>
                    {baselineBreakdown.experience?.detail && (
                      <p className="text-[10px] text-inkSoft pl-3 font-sans">{baselineBreakdown.experience.detail}</p>
                    )}

                    <div className="flex justify-between">
                      <span>• Education Factor:</span>
                      <span className="font-semibold">{baselineBreakdown.education?.score ?? 0} / 20 pts</span>
                    </div>
                    {baselineBreakdown.education?.detail && (
                      <p className="text-[10px] text-inkSoft pl-3 font-sans">{baselineBreakdown.education.detail}</p>
                    )}

                    <div className="flex justify-between">
                      <span>• Resume Keyword Matches:</span>
                      <span className="font-semibold">{baselineBreakdown.keywords?.score ?? 0} / 25 pts</span>
                    </div>
                    {baselineBreakdown.keywords?.detail && (
                      <p className="text-[10px] text-inkSoft pl-3 font-sans">
                        {baselineBreakdown.keywords.detail}
                        {baselineBreakdown.keywords.matchedKeywords?.length > 0 && (
                          <span className="text-positive block mt-0.5">
                            Matched: {baselineBreakdown.keywords.matchedKeywords.join(", ")}
                          </span>
                        )}
                        {baselineBreakdown.keywords.missingKeywords?.length > 0 && (
                          <span className="text-warning block mt-0.5">
                            Missing in text: {baselineBreakdown.keywords.missingKeywords.join(", ")}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* SkillBridge Card */}
            <div className="bg-white border-2 border-accent/30 rounded-xl p-5 shadow-soft relative overflow-hidden bg-gradient-to-br from-white to-accentLight/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-positive animate-pulse" />
                    SkillBridge Verified Score
                  </span>
                  {improvement > 0 ? (
                    <span className="text-xs font-bold bg-positiveLight text-positive border border-positive/20 px-2 py-0.5 rounded-full">
                      +{improvement}% improvement
                    </span>
                  ) : (
                    <span className="text-xs font-semibold bg-bg text-inkSoft border border-border px-2 py-0.5 rounded-full">
                      Evidence-Grounded
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-positive">{skillBridge}%</p>
                  <span className="text-xs text-inkSoft font-medium">/ 100 max</span>
                </div>
                <p className="text-xs text-inkSoft mt-2 leading-relaxed">
                  Evaluates verified demonstrated capability across hands-on practical projects, professional work history, and adaptive skill interview.
                </p>
              </div>

              {/* SkillBridge Mathematical Breakdown */}
              <div className="mt-4 pt-3 border-t border-accent/20">
                <button
                  type="button"
                  onClick={() => setShowSbMath(!showSbMath)}
                  className="text-xs font-semibold text-accent hover:underline flex items-center justify-between w-full cursor-pointer"
                >
                  <span>{showSbMath ? "▲ Hide Score Breakdown" : "▼ Show Exact Score Breakdown"}</span>
                  <span className="text-[11px] text-positive font-mono">
                    {matchBreakdown.skillCoverage?.score ?? (matchedSkills.length > 0 ? Math.round((matchedSkills.length / (matchedSkills.length + missingSkills.length || 1)) * 80) : 0)} +{" "}
                    {matchBreakdown.projectBonus?.score ?? (skillBridge >= 12 ? 12 : 8)} +{" "}
                    {matchBreakdown.interviewBonus?.score ?? 0} = {skillBridge}%
                  </span>
                </button>

                {showSbMath && (
                  <div className="mt-3 space-y-2 bg-accentLight/40 p-3 rounded-lg border border-accent/20 text-xs text-ink animate-fadeIn font-mono">
                    <div className="flex justify-between">
                      <span>• Verified Skill Coverage:</span>
                      <span className="font-semibold">{matchBreakdown.skillCoverage?.score ?? 0} / 80 pts</span>
                    </div>
                    <p className="text-[10px] text-inkSoft pl-3 font-sans">
                      {matchedSkills.length} of {matchedSkills.length + missingSkills.length} job-required skills verified via candidate evidence.
                    </p>

                    <div className="flex justify-between">
                      <span>• Practical Projects Depth:</span>
                      <span className="font-semibold">+{matchBreakdown.projectBonus?.score ?? (skillBridge >= 12 ? 12 : 8)} / 12 pts</span>
                    </div>
                    <p className="text-[10px] text-inkSoft pl-3 font-sans">
                      {matchBreakdown.projectBonus?.detail || "+12% bonus for maintaining logged practical projects demonstrating applied software development."}
                    </p>

                    <div className="flex justify-between">
                      <span>• Adaptive Interview Demonstration:</span>
                      <span className="font-semibold">+{matchBreakdown.interviewBonus?.score ?? 0} / 8 pts</span>
                    </div>
                    <p className="text-[10px] text-inkSoft pl-3 font-sans">
                      {matchBreakdown.interviewBonus?.detail || (application?.interviewAnswers?.length > 0 ? "+8% dynamic interview bonus awarded." : "0% (take role interview to unlock).")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Explanation when Matched Skills is 0 but Score is 12% */}
          {matchedSkills.length === 0 && skillBridge > 0 && (
            <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 leading-relaxed space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <span>ℹ️</span> Score Composition Note:
              </p>
              <p>
                Your SkillBridge score of <strong>{skillBridge}%</strong> reflects a <strong>+{matchBreakdown.projectBonus?.score ?? 12}% Practical Project Portfolio Depth Bonus</strong> for documenting applied projects. You currently have <strong>0 demonstrated skills matching this specific role's required skills</strong>. Take the role-specific AI interview to demonstrate your capabilities and unlock up to 80 additional skill match points!
              </p>
            </div>
          )}

          {/* Potentially Overlooked Banner */}
          {application?.potentiallyOverlooked && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <span className="text-xl">⚡</span>
              <div>
                <p className="text-sm font-semibold text-amber-900">
                  Potentially Overlooked by Traditional Screening
                </p>
                <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                  Traditional ATS filters rated this candidate at {baseline}%, but SkillBridge uncovered strong demonstrated capability ({skillBridge}%) through verified multi-source evidence.
                </p>
              </div>
            </div>
          )}

          {/* Evaluation Narrative Header */}
          {application?.explanation && (
            <div className="bg-accentLight/60 border border-accent/20 rounded-xl p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-accent mb-1.5">
                How SkillBridge Evaluated Your Match
              </p>
              <p className="text-sm text-ink leading-relaxed">
                {application.explanation}
              </p>
            </div>
          )}

          {/* Matched Skills Overview */}
          <div className="bg-white border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-wider text-inkSoft">
                Demonstrated Skills ({matchedSkills.length})
              </p>
              {matchedSkills.length > 0 && (
                <button
                  onClick={() => setActiveTab("evidence")}
                  className="text-xs text-accent font-semibold hover:underline"
                >
                  View Evidence Quotes →
                </button>
              )}
            </div>
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
              <div className="text-xs text-inkSoft space-y-1">
                <p className="font-medium text-ink">No role-specific skills demonstrated yet.</p>
                <p>None of the required skills for this job were evidenced in your current dossier. Use the Dynamic Interview or add projects to demonstrate them.</p>
              </div>
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
                  View Personalized Roadmap →
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
              <div className="p-8 text-center text-xs text-inkSoft space-y-2">
                <p className="font-semibold text-ink">No granular evidence items recorded for this specific job.</p>
                <p>Take the role-specific dynamic interview or log practical projects to build up your verified skill bank.</p>
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
                SkillBridge Candidate Guide
              </span>
              <span className="text-[10px] bg-accent text-white px-2 py-0.5 rounded-full font-semibold">
                Personalized Learning & Evidence Roadmap
              </span>
            </div>
            <h2 className="text-lg font-bold text-ink">
              Bridging Your Match Gap with Concrete Evidence
            </h2>
            <p className="text-xs text-inkSoft mt-1">
              SkillBridge connects learning to proof: complete the practical tasks, produce the evidence, and re-verify your match score.
            </p>
          </div>

          <div className="divide-y divide-border">
            {guide?.skillsToImprove && guide.skillsToImprove.length > 0 ? (
              guide.skillsToImprove.map((item, idx) => (
                <div key={idx} className="p-6 space-y-4">
                  {/* Skill Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-accent bg-accentLight px-2 py-0.5 rounded-full">
                          PRIORITY {idx + 1}
                        </span>
                        <h4 className="text-base font-bold text-ink">{item.skill}</h4>
                      </div>
                      <p className="text-xs text-inkSoft mt-1.5 leading-relaxed">
                        <strong className="text-ink font-semibold">Why this matters for this role:</strong> {item.whyItMatters}
                      </p>
                    </div>

                    <span className="text-[11px] font-semibold bg-warningLight text-warning border border-warning/20 px-2.5 py-1 rounded-full shrink-0">
                      {item.currentStatus || "Missing verified evidence"}
                    </span>
                  </div>

                  {/* Sequential Learning Plan */}
                  {(item.learningPlan?.length > 0 || item.roadmap?.length > 0) && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-inkSoft">
                        Actionable Learning Milestones
                      </p>
                      <div className="space-y-2">
                        {(item.learningPlan || item.roadmap || []).map((step, sIdx) => (
                          <div
                            key={sIdx}
                            className="flex items-start gap-3 text-xs text-ink bg-bg/60 p-2.5 rounded-lg border border-border/60"
                          >
                            <span className="w-5 h-5 rounded-full bg-accent text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                              {sIdx + 1}
                            </span>
                            <span className="pt-0.5 leading-relaxed">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Practical Task & Project Idea */}
                  {(item.practicalTask || item.projectIdea) && (
                    <div className="grid md:grid-cols-2 gap-3">
                      {item.practicalTask && (
                        <div className="bg-accentLight/30 border border-accent/20 rounded-xl p-3.5 text-xs space-y-1">
                          <p className="font-bold text-accent uppercase tracking-wider text-[10px]">
                            🛠️ Practical Exercise
                          </p>
                          <p className="text-ink leading-relaxed">{item.practicalTask}</p>
                        </div>
                      )}

                      {item.projectIdea && (
                        <div className="bg-accentLight/30 border border-accent/20 rounded-xl p-3.5 text-xs space-y-1">
                          <p className="font-bold text-accent uppercase tracking-wider text-[10px]">
                            🚀 Project Application
                          </p>
                          <p className="text-ink leading-relaxed">{item.projectIdea}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Evidence to Produce & Re-verification */}
                  {(item.evidenceToProduce?.length > 0 || item.verificationStep) && (
                    <div className="bg-bg/80 border border-border rounded-xl p-4 space-y-2 text-xs">
                      {item.evidenceToProduce?.length > 0 && (
                        <div>
                          <p className="font-bold text-ink text-[11px] mb-1">
                            📄 Tangible Proof to Upload:
                          </p>
                          <ul className="list-disc list-inside space-y-0.5 text-inkSoft">
                            {item.evidenceToProduce.map((ev, eIdx) => (
                              <li key={eIdx}>{ev}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {item.verificationStep && (
                        <div className="pt-1.5 border-t border-border/80">
                          <span className="font-bold text-ink text-[11px]">🔄 SkillBridge Re-Verification: </span>
                          <span className="text-inkSoft">{item.verificationStep}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Curated Resources */}
                  {item.resources && item.resources.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-inkSoft">
                        Verified Learning Resources
                      </p>
                      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {item.resources.map((res, rIdx) => (
                          <a
                            key={rIdx}
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 border border-border rounded-xl bg-white hover:border-accent/40 hover:shadow-xs transition-all text-xs flex flex-col justify-between group"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-accent bg-accentLight px-1.5 py-0.5 rounded">
                                  #{res.rank || rIdx + 1}
                                </span>
                                <span className="text-[10px] text-inkSoft uppercase font-medium">
                                  {res.type || "Docs"}
                                </span>
                              </div>
                              <p className="font-semibold text-ink group-hover:text-accent transition-colors line-clamp-1">
                                {res.name}
                              </p>
                              <p className="text-[11px] text-inkSoft line-clamp-2 leading-relaxed">
                                {res.reason}
                              </p>
                            </div>
                            <span className="text-[10px] text-accent font-semibold mt-2 block group-hover:underline">
                              Visit Resource ↗
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certifications if available */}
                  {item.certifications && item.certifications.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold uppercase tracking-wider text-inkSoft">
                        Standard Industry Credential
                      </p>
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
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-inkSoft space-y-3">
                <p className="font-semibold text-ink text-sm">
                  Personalized Learning Roadmap Not Generated Yet
                </p>
                <p className="max-w-md mx-auto">
                  The Candidate Guide requires an active application evaluation to produce your personalized learning path.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationResult;

