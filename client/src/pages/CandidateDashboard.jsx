import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/shared/Navbar";
import WorkHistoryForm from "../components/WorkHistoryForm";
import ApplicationResult from "../components/ApplicationResult";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const CandidateDashboard = () => {
  const { user } = useAuth();
  const [candidate, setCandidate] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // overview | resume | projects | history | education | certificates | links
  const [saving, setSaving] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const fileInputRef = useRef(null);

  // Forms state
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    technologies: "",
    link: "",
  });

  const [certificates, setCertificates] = useState([]);
  const [newCert, setNewCert] = useState({
    name: "",
    issuer: "",
    date: "",
    skills: "",
    verificationUrl: "",
  });

  const [education, setEducation] = useState([]);
  const [newEdu, setNewEdu] = useState({
    degree: "",
    institution: "",
    graduationYear: "",
  });

  const [resumeText, setResumeText] = useState("");
  const [profileLinks, setProfileLinks] = useState({
    linkedin: "",
    github: "",
    portfolio: "",
    bio: "",
  });

  const [expandedAppId, setExpandedAppId] = useState(null);

  useEffect(() => {
    const fetchCandidateData = async () => {
      try {
        const [profileRes, appsRes] = await Promise.all([
          api.get("/candidate/profile"),
          api.get("/application/my"),
        ]);

        const data = profileRes.data;
        setCandidate(data);
        setProjects(data.projects || []);
        setCertificates(data.certificates || []);
        setEducation(data.education || []);
        setResumeText(data.resumeText || "");
        setProfileLinks({
          linkedin: data.profileLinks?.linkedin || "",
          github: data.profileLinks?.github || "",
          portfolio: data.profileLinks?.portfolio || "",
          bio: data.bio || "",
        });

        setApplications(appsRes.data || []);
      } catch (err) {
        console.error("Failed to load candidate dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidateData();
  }, []);

  // Compute Profile Completeness
  const hasResume = Boolean(candidate?.resumeText && candidate.resumeText.trim().length > 15);
  const hasWorkHistory = Boolean(candidate?.workHistory && candidate.workHistory.length > 0);
  const hasProjects = Boolean(candidate?.projects && candidate.projects.length > 0);
  const hasLinks = Boolean(candidate?.bio || candidate?.profileLinks?.github || candidate?.profileLinks?.linkedin);

  const completedStepsCount =
    (hasResume ? 1 : 0) +
    (hasWorkHistory ? 1 : 0) +
    (hasProjects ? 1 : 0) +
    (hasLinks ? 1 : 0);

  const completenessPercentage = Math.round((completedStepsCount / 4) * 100);
  const isMandatoryComplete = hasResume && hasWorkHistory && hasProjects;

  const handleWorkHistorySaved = (data) => {
    setCandidate(data);
    setStatusMsg("Work history updated and career continuity analyzed!");
    setTimeout(() => setStatusMsg(""), 4000);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setStatusMsg("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await api.post("/candidate/resume-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setCandidate(data.candidate);
      setResumeText(data.candidate.resumeText || "");
      if (data.candidate.projects) setProjects(data.candidate.projects);
      if (data.candidate.education) setEducation(data.candidate.education);
      setStatusMsg(
        `✓ Resume file "${file.name}" analyzed with Eden AI! Extracted ${data.extractedSkillsCount || 0} demonstrated skills.`
      );
    } catch (err) {
      setStatusMsg(
        err.response?.data?.message ||
          "Failed to process resume file. You may also paste text directly."
      );
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTimeout(() => setStatusMsg(""), 5000);
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!newProject.title || !newProject.description) return;
    setSaving(true);
    setStatusMsg("");

    const techArray = newProject.technologies
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const updatedProjects = [
      ...projects,
      {
        title: newProject.title,
        description: newProject.description,
        technologies: techArray,
        link: newProject.link,
      },
    ];

    try {
      const { data } = await api.post("/candidate/projects", {
        projects: updatedProjects,
      });
      setCandidate(data);
      setProjects(data.projects || []);
      setNewProject({ title: "", description: "", technologies: "", link: "" });
      setStatusMsg("Project added and skills extracted to your evidence repository!");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
      setTimeout(() => setStatusMsg(""), 4000);
    }
  };

  const handleAddCertificate = async (e) => {
    e.preventDefault();
    if (!newCert.name || !newCert.issuer) return;
    setSaving(true);
    setStatusMsg("");

    const skillArray = newCert.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const updatedCerts = [
      ...certificates,
      {
        name: newCert.name,
        issuer: newCert.issuer,
        date: newCert.date,
        skills: skillArray,
        verificationUrl: newCert.verificationUrl,
      },
    ];

    try {
      const { data } = await api.post("/candidate/certificates", {
        certificates: updatedCerts,
      });
      setCandidate(data);
      setCertificates(data.certificates || []);
      setNewCert({ name: "", issuer: "", date: "", skills: "", verificationUrl: "" });
      setStatusMsg("Certificate saved as supporting evidence!");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
      setTimeout(() => setStatusMsg(""), 4000);
    }
  };

  const handleSaveResume = async (e) => {
    e.preventDefault();
    if (!resumeText.trim()) return;
    setSaving(true);
    setStatusMsg("");

    try {
      const { data } = await api.post("/candidate/resume", { resumeText });
      setCandidate(data.candidate);
      if (data.candidate.projects) setProjects(data.candidate.projects);
      if (data.candidate.education) setEducation(data.candidate.education);
      setStatusMsg(
        `Resume analyzed! Successfully extracted ${data.extractedSkillsCount || 0} demonstrated skills.`
      );
    } catch (err) {
      console.error(err);
      setStatusMsg("Failed to analyze resume text.");
    } finally {
      setSaving(false);
      setTimeout(() => setStatusMsg(""), 5000);
    }
  };

  const handleSaveProfileLinks = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg("");

    try {
      const { data } = await api.put("/candidate/profile", {
        bio: profileLinks.bio,
        profileLinks,
      });
      setCandidate(data);
      setStatusMsg("Profile and links updated successfully!");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
      setTimeout(() => setStatusMsg(""), 4000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 pt-16 text-center">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full mb-3" />
          <p className="text-sm font-medium text-ink">Loading your candidate dossier...</p>
        </div>
      </div>
    );
  }

  const demonstratedSkills = candidate?.skillEvidence || [];

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 pt-10 pb-20 space-y-6">
        {/* Top Header Card */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-card relative overflow-hidden bg-gradient-to-r from-white via-white to-accentLight/20">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold text-ink">{candidate?.name || user?.name}</h1>
                <span className="text-[11px] font-bold bg-accentLight text-accent border border-accent/25 px-3 py-0.5 rounded-full uppercase tracking-wider">
                  Verified Candidate
                </span>
              </div>
              <p className="text-xs text-inkSoft mt-1">
                Demonstrated Skill-First Dossier · Reusable Evidence Repository
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/jobs"
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-soft flex items-center gap-1.5 ${
                  isMandatoryComplete
                    ? "bg-accent text-white hover:bg-accent/90 hover:scale-[1.02]"
                    : "bg-inkSoft/20 text-inkSoft cursor-pointer hover:bg-inkSoft/30"
                }`}
              >
                Browse Open Roles →
              </Link>
            </div>
          </div>

          {/* Profile Completeness Meter */}
          <div className="mt-5 pt-4 border-t border-border space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-ink flex items-center gap-1.5">
                <span>⚡ Profile Readiness:</span>
                <span className={isMandatoryComplete ? "text-positive font-bold" : "text-amber-600 font-bold"}>
                  {completenessPercentage}% Complete
                </span>
              </span>
              <span className="text-[11px] text-inkSoft font-medium">
                {isMandatoryComplete
                  ? "✓ All mandatory requirements fulfilled. You can apply to roles!"
                  : "Complete mandatory items to unlock 1-click job applications."}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-bg h-2.5 rounded-full overflow-hidden border border-border/80">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isMandatoryComplete
                    ? "bg-gradient-to-r from-accent to-positive"
                    : "bg-gradient-to-r from-amber-400 to-accent"
                }`}
                style={{ width: `${completenessPercentage}%` }}
              />
            </div>

            {/* 4 Checklist Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setActiveTab("resume")}
                className={`p-2 rounded-xl border text-[11px] font-semibold flex items-center gap-1.5 transition-all text-left ${
                  hasResume
                    ? "bg-positiveLight/70 border-positive/30 text-positive"
                    : "bg-bg border-amber-300 text-amber-800"
                }`}
              >
                <span>{hasResume ? "✓" : "○"}</span>
                <span className="truncate">1. Resume {hasResume ? "Uploaded" : "(Required)"}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("history")}
                className={`p-2 rounded-xl border text-[11px] font-semibold flex items-center gap-1.5 transition-all text-left ${
                  hasWorkHistory
                    ? "bg-positiveLight/70 border-positive/30 text-positive"
                    : "bg-bg border-amber-300 text-amber-800"
                }`}
              >
                <span>{hasWorkHistory ? "✓" : "○"}</span>
                <span className="truncate">2. Experience {hasWorkHistory ? "Logged" : "(Required)"}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("projects")}
                className={`p-2 rounded-xl border text-[11px] font-semibold flex items-center gap-1.5 transition-all text-left ${
                  hasProjects
                    ? "bg-positiveLight/70 border-positive/30 text-positive"
                    : "bg-bg border-amber-300 text-amber-800"
                }`}
              >
                <span>{hasProjects ? "✓" : "○"}</span>
                <span className="truncate">3. Project {hasProjects ? "Added" : "(Required)"}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("links")}
                className={`p-2 rounded-xl border text-[11px] font-semibold flex items-center gap-1.5 transition-all text-left ${
                  hasLinks
                    ? "bg-positiveLight/70 border-positive/30 text-positive"
                    : "bg-bg border-border text-inkSoft"
                }`}
              >
                <span>{hasLinks ? "✓" : "○"}</span>
                <span className="truncate">4. Social Links</span>
              </button>
            </div>
          </div>
        </div>

        {/* Status Toast */}
        {statusMsg && (
          <div className="bg-positiveLight border border-positive/30 text-positive text-xs font-semibold p-3.5 rounded-xl animate-fadeIn shadow-xs flex items-center gap-2">
            <span>✓</span> {statusMsg}
          </div>
        )}

        {/* Career Break Banner if detected */}
        {candidate?.hasCareerGap && (
          <div className="bg-gradient-to-r from-accentLight/60 via-blue-50 to-white border border-accent/25 rounded-2xl p-5 shadow-xs flex items-start gap-3.5">
            <span className="text-2xl">🌱</span>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-accent">
                Career Transition Detected ({candidate.gapDurationMonths} Months)
              </h3>
              <p className="text-xs text-inkSoft leading-relaxed">
                SkillBridge bridges career breaks by prioritizing your verified hands-on projects and adaptive interview performance over continuous employment timelines.
              </p>
            </div>
          </div>
        )}

        {/* Reusable Demonstrated Skills Bank */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-ink flex items-center gap-2">
                <span>⚡</span> Reusable Demonstrated Skills Bank
              </h2>
              <p className="text-xs text-inkSoft mt-0.5">
                Skills discovered across Eden AI resume extraction, projects, work history, and adaptive interviews.
              </p>
            </div>
            <span className="text-xs font-bold bg-accentLight text-accent px-3 py-1 rounded-full border border-accent/20">
              {demonstratedSkills.length} Verified Competencies
            </span>
          </div>

          {demonstratedSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-2">
              {demonstratedSkills.map((sk, idx) => (
                <span
                  key={idx}
                  className="bg-bg border border-border text-ink text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xs hover:border-accent/40 transition-colors"
                >
                  <span className="text-positive font-bold">✓</span>
                  <span className="font-semibold">{sk.skill || sk.name}</span>
                  <span className="text-[10px] text-accent uppercase font-bold bg-accentLight px-1.5 py-0.5 rounded border border-accent/15">
                    {sk.source?.replace("_", " ")}
                  </span>
                </span>
              ))}
            </div>
          ) : (
            <div className="bg-bg border border-dashed border-border rounded-xl p-4 text-center text-xs text-inkSoft">
              Upload your resume or add your projects below to populate your verified skill bank.
            </div>
          )}
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-border pb-2 text-xs font-bold">
          {[
            { id: "overview", label: "📋 Applications & Matches" },
            { id: "resume", label: "📄 Upload / Paste Resume" },
            { id: "projects", label: "🚀 Projects & Tech Stack" },
            { id: "history", label: "💼 Work History & Continuity" },
            { id: "education", label: "🎓 Education Details" },
            { id: "certificates", label: "📜 Certificates" },
            { id: "links", label: "🔗 Social & Portfolio Links" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-accent text-white shadow-soft font-bold scale-[1.02]"
                  : "bg-white border border-border text-inkSoft hover:text-ink hover:border-accent/30"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: APPLICATIONS & RESULTS */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-ink">My Submitted Applications ({applications.length})</h3>

            {applications.length > 0 ? (
              <div className="space-y-4">
                {applications.map((app) => {
                  const isExpanded = expandedAppId === app._id;

                  return (
                    <div
                      key={app._id}
                      className="bg-white border border-border rounded-2xl p-6 shadow-card hover:border-accent/30 transition-all space-y-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-ink">{app.job?.title || "Job Application"}</h4>
                            {app.potentiallyOverlooked && (
                              <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full">
                                ⚡ Overlooked Talent Match
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-inkSoft mt-0.5">{app.job?.company} · Applied on {new Date(app.createdAt).toLocaleDateString()}</p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-[10px] uppercase font-bold text-inkSoft">SkillBridge Score</p>
                            <p className="text-2xl font-bold text-positive">{app.matchScore}%</p>
                          </div>
                          {app.improvement > 0 && (
                            <span className="text-xs font-bold bg-positiveLight text-positive border border-positive/20 px-2.5 py-1 rounded-lg">
                              +{app.improvement}%
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <div className="flex flex-wrap gap-1.5">
                          {app.matchedSkills?.slice(0, 5).map((s) => (
                            <span key={s} className="text-[11px] bg-positiveLight text-positive px-2.5 py-0.5 rounded-full font-medium">
                              ✓ {s}
                            </span>
                          ))}
                        </div>

                        <button
                          onClick={() => setExpandedAppId(isExpanded ? null : app._id)}
                          className="bg-bg hover:bg-accentLight text-accent border border-accent/20 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs"
                        >
                          {isExpanded ? "Hide Analysis ▲" : "View Analysis & Guide ▼"}
                        </button>
                      </div>

                      {/* Expandable Accordion Analysis */}
                      {isExpanded && (
                        <div className="pt-4 border-t border-border animate-fadeIn">
                          <ApplicationResult application={app} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white border border-border rounded-2xl p-10 text-center text-inkSoft space-y-3">
                <p className="text-base font-semibold text-ink">No applications submitted yet.</p>
                <p className="text-xs text-inkSoft">
                  Once you complete your mandatory profile (Resume, Work History, Project), you can apply with 1-click!
                </p>
                <Link
                  to="/jobs"
                  className="inline-block bg-accent text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-accent/90 shadow-soft"
                >
                  Explore Open Jobs
                </Link>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: RESUME UPLOAD & PARSER */}
        {activeTab === "resume" && (
          <div className="space-y-6">
            <div className="bg-white border border-border rounded-2xl p-6 shadow-card space-y-5">
              <div>
                <span className="text-xs font-bold text-accent uppercase tracking-wider">
                  Mandatory Requirement 1
                </span>
                <h3 className="text-lg font-bold text-ink mt-0.5">Resume Evidence Extraction (Eden AI)</h3>
                <p className="text-xs text-inkSoft mt-1">
                  Upload your PDF / DOCX resume. Eden AI extracts structured education, work experience, and evidence-grounded technical skills.
                </p>
              </div>

              {/* PDF File Upload Box */}
              <div className="border-2 border-dashed border-accent/40 rounded-2xl p-6 text-center bg-accentLight/15 hover:bg-accentLight/25 transition-all">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  id="resume-file-input"
                  disabled={uploadingFile}
                />
                <label
                  htmlFor="resume-file-input"
                  className="cursor-pointer block space-y-2"
                >
                  <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center mx-auto text-xl shadow-soft">
                    {uploadingFile ? "⏳" : "📤"}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ink">
                      {uploadingFile ? "Eden AI is Parsing Resume..." : "Click to Upload Resume (PDF / DOCX / TXT)"}
                    </p>
                    <p className="text-xs text-inkSoft mt-0.5">
                      Eden AI OCR Resume Extraction up to 10MB
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex items-center gap-3 text-xs text-inkSoft">
                <div className="h-px bg-border flex-1" />
                <span>OR PASTE RAW TEXT</span>
                <div className="h-px bg-border flex-1" />
              </div>

              {/* Raw Text Fallback Form */}
              <form onSubmit={handleSaveResume} className="space-y-3">
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume text, work experience summary, or technical achievements here..."
                  rows={6}
                  className="w-full border border-border rounded-xl p-3.5 text-xs focus:outline-none focus:border-accent font-mono resize-none"
                />

                <button
                  type="submit"
                  disabled={saving || !resumeText.trim()}
                  className="bg-accent text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-accent/90 transition-all disabled:opacity-50 flex items-center gap-2 shadow-soft"
                >
                  {saving ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Parsing Resume Data...
                    </>
                  ) : (
                    <>Extract & Save Demonstrated Skills →</>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: PROJECTS */}
        {activeTab === "projects" && (
          <div className="space-y-6">
            <div className="bg-white border border-border rounded-2xl p-6 shadow-card space-y-4">
              <div>
                <span className="text-xs font-bold text-accent uppercase tracking-wider">
                  Mandatory Requirement 2
                </span>
                <h3 className="text-lg font-bold text-ink mt-0.5">Practical Projects & Tech Stack</h3>
                <p className="text-xs text-inkSoft mt-1">
                  Projects prove hands-on capability. The AI extracts technical depth, component architecture, and API integration evidence from your descriptions.
                </p>
              </div>

              <form onSubmit={handleAddProject} className="space-y-3">
                <input
                  type="text"
                  placeholder="Project Title (e.g. StoreSphere E-Commerce Dashboard, Realtime Chat App)"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  required
                  className="w-full border border-border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-accent"
                />

                <textarea
                  placeholder="Describe your implementation: what components you built, APIs connected, state management choices, problems solved, and error handling..."
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  required
                  rows={4}
                  className="w-full border border-border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-accent resize-none"
                />

                <div className="grid md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Technologies used (comma separated: React, Node.js, REST APIs, Tailwind)"
                    value={newProject.technologies}
                    onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value })}
                    className="w-full border border-border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-accent"
                  />

                  <input
                    type="url"
                    placeholder="Project / GitHub Link (optional)"
                    value={newProject.link}
                    onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
                    className="w-full border border-border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-accent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="bg-accent text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-accent/90 transition-all disabled:opacity-50 shadow-soft"
                >
                  {saving ? "Extracting..." : "+ Save Project & Extract Skills"}
                </button>
              </form>
            </div>

            {/* Existing Projects */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-ink">Logged Projects ({projects.length})</h4>
              {projects.map((proj, i) => (
                <div key={i} className="bg-white border border-border rounded-2xl p-5 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-sm text-ink">{proj.title}</h5>
                    {proj.link && (
                      <a
                        href={proj.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-accent font-semibold hover:underline"
                      >
                        View Repository ↗
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-inkSoft leading-relaxed">{proj.description}</p>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {proj.technologies.map((t) => (
                        <span key={t} className="bg-accentLight text-accent text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: WORK HISTORY */}
        {activeTab === "history" && (
          <div className="space-y-4">
            <div className="bg-white border border-border rounded-2xl p-6 shadow-card space-y-4">
              <div>
                <span className="text-xs font-bold text-accent uppercase tracking-wider">
                  Mandatory Requirement 3
                </span>
                <h3 className="text-lg font-bold text-ink mt-0.5">Work History & Career Continuity</h3>
                <p className="text-xs text-inkSoft mt-1">
                  Log your past roles. SkillBridge automatically analyzes career continuity without penalizing career transitions.
                </p>
              </div>

              <WorkHistoryForm onSaved={handleWorkHistorySaved} />
            </div>
          </div>
        )}

        {/* TAB 5: EDUCATION DETAILS */}
        {activeTab === "education" && (
          <div className="space-y-6">
            <div className="bg-white border border-border rounded-2xl p-6 shadow-card space-y-4">
              <div>
                <h3 className="text-lg font-bold text-ink">Education & Academic Background</h3>
                <p className="text-xs text-inkSoft mt-0.5">
                  Degrees and colleges parsed from your resume via Eden AI.
                </p>
              </div>

              {education.length > 0 ? (
                <div className="space-y-3">
                  {education.map((edu, idx) => (
                    <div key={idx} className="bg-bg border border-border rounded-xl p-4 space-y-1">
                      <h4 className="text-sm font-bold text-ink">{edu.degree || "Degree"}</h4>
                      <p className="text-xs text-inkSoft">{edu.institution || "Institution"}</p>
                      {edu.graduationYear && (
                        <p className="text-[11px] text-accent font-semibold">Graduation Year: {edu.graduationYear}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-bg border border-dashed border-border rounded-xl p-6 text-center text-xs text-inkSoft">
                  No education details recorded yet. Uploading your resume will automatically populate this section.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: CERTIFICATES */}
        {activeTab === "certificates" && (
          <div className="space-y-6">
            <div className="bg-white border border-border rounded-2xl p-6 shadow-card space-y-4">
              <div>
                <h3 className="text-lg font-bold text-ink">Certificates & Supporting Proof</h3>
                <p className="text-xs text-inkSoft mt-0.5">
                  Certificates act as supporting evidence to boost skill confidence.
                </p>
              </div>

              <form onSubmit={handleAddCertificate} className="space-y-3">
                <div className="grid md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Certificate Title (e.g. Meta Front-End Developer)"
                    value={newCert.name}
                    onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                    required
                    className="w-full border border-border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-accent"
                  />
                  <input
                    type="text"
                    placeholder="Issuer / Platform (e.g. Coursera, freeCodeCamp, AWS)"
                    value={newCert.issuer}
                    onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                    required
                    className="w-full border border-border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Skills covered (comma separated: React, JS, Git)"
                    value={newCert.skills}
                    onChange={(e) => setNewCert({ ...newCert, skills: e.target.value })}
                    className="w-full border border-border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-accent"
                  />
                  <input
                    type="text"
                    placeholder="Year / Date"
                    value={newCert.date}
                    onChange={(e) => setNewCert({ ...newCert, date: e.target.value })}
                    className="w-full border border-border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-accent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="bg-accent text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-accent/90 shadow-soft"
                >
                  {saving ? "Saving..." : "+ Save Certificate"}
                </button>
              </form>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-ink">Saved Certificates ({certificates.length})</h4>
              {certificates.map((cert, i) => (
                <div key={i} className="bg-white border border-border rounded-xl p-4 shadow-xs flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-xs text-ink">{cert.name}</h5>
                    <p className="text-[11px] text-inkSoft">{cert.issuer} {cert.date ? `· ${cert.date}` : ""}</p>
                    {cert.skills && cert.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {cert.skills.map((s) => (
                          <span key={s} className="bg-bg text-inkSoft text-[10px] px-2 py-0.5 rounded">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: SOCIAL & PORTFOLIO */}
        {activeTab === "links" && (
          <div className="bg-white border border-border rounded-2xl p-6 shadow-card space-y-4">
            <div>
              <h3 className="text-lg font-bold text-ink">Profile Bio & Portfolio Links</h3>
              <p className="text-xs text-inkSoft mt-0.5">
                Add your online profiles so employers can review your portfolio and code repositories.
              </p>
            </div>

            <form onSubmit={handleSaveProfileLinks} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-inkSoft uppercase tracking-wider">Candidate Bio</label>
                <textarea
                  value={profileLinks.bio}
                  onChange={(e) => setProfileLinks({ ...profileLinks, bio: e.target.value })}
                  placeholder="Passionate engineer building accessible, fast web applications..."
                  rows={3}
                  className="w-full border border-border rounded-xl p-3 text-xs focus:outline-none focus:border-accent resize-none mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-inkSoft uppercase tracking-wider">GitHub URL</label>
                <input
                  type="url"
                  placeholder="https://github.com/yourhandle"
                  value={profileLinks.github}
                  onChange={(e) => setProfileLinks({ ...profileLinks, github: e.target.value })}
                  className="w-full border border-border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-accent mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-inkSoft uppercase tracking-wider">LinkedIn URL</label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/yourhandle"
                  value={profileLinks.linkedin}
                  onChange={(e) => setProfileLinks({ ...profileLinks, linkedin: e.target.value })}
                  className="w-full border border-border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-accent mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-inkSoft uppercase tracking-wider">Portfolio URL</label>
                <input
                  type="url"
                  placeholder="https://yourportfolio.dev"
                  value={profileLinks.portfolio}
                  onChange={(e) => setProfileLinks({ ...profileLinks, portfolio: e.target.value })}
                  className="w-full border border-border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-accent mt-1"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="bg-accent text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-accent/90 shadow-soft"
              >
                {saving ? "Saving..." : "Save Profile Links"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateDashboard;
