import Candidate from "../models/Candidate.js";
import Application from "../models/Application.js";
import Job from "../models/Job.js";
import {
  generateNextInterviewQuestion,
  analyzeInterviewAnswer,
  extractSkillsFromCompleteInterview,
  extractSkillsFromInterview,
} from "../services/aiService.js";
import { parseResumeWithEdenAI, parseResumeLocally } from "../services/resume/edenParser.js";
import { normalizeSkill, normalizeSkillList } from "../services/matching/skillNormalizer.js";
import { PDFParse } from "pdf-parse";

// Month-difference helper
const monthsBetween = (start, end) => {
  return (
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth())
  );
};

// Gap analysis
const analyzeGaps = (workHistory) => {
  if (!workHistory || workHistory.length === 0) {
    return { careerGaps: [], hasCareerGap: false, gapDurationMonths: 0 };
  }

  const sorted = [...workHistory].sort(
    (a, b) => new Date(a.startDate) - new Date(b.startDate)
  );

  const careerGaps = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    if (!sorted[i].endDate) continue;
    const gapStart = new Date(sorted[i].endDate);
    const gapEnd = new Date(sorted[i + 1].startDate);
    const duration = monthsBetween(gapStart, gapEnd);
    if (duration > 0) {
      careerGaps.push({
        startDate: gapStart,
        endDate: gapEnd,
        durationMonths: duration,
        isCurrent: false,
      });
    }
  }

  let hasCareerGap = false;
  let gapDurationMonths = 0;

  const mostRecent = sorted[sorted.length - 1];
  if (mostRecent.endDate) {
    const duration = monthsBetween(new Date(mostRecent.endDate), new Date());
    if (duration > 0) {
      careerGaps.push({
        startDate: mostRecent.endDate,
        endDate: null,
        durationMonths: duration,
        isCurrent: true,
      });
      hasCareerGap = duration >= 3;
      gapDurationMonths = duration;
    }
  }

  return { careerGaps, hasCareerGap, gapDurationMonths };
};

// Helper to merge skill evidence without duplicates
const mergeSkillEvidence = (existingList = [], newItems = []) => {
  const map = new Map();
  existingList.forEach((item) => {
    if (item.skill) {
      const canonical = normalizeSkill(item.skill);
      map.set(canonical.toLowerCase().trim(), {
        ...item,
        skill: canonical,
      });
    }
  });

  newItems.forEach((item) => {
    const raw = item.skill || item.name || "";
    const canonical = normalizeSkill(raw);
    const key = canonical.toLowerCase().trim();
    if (key) {
      const existing = map.get(key);
      if (!existing || (item.strength === "High" && existing.strength !== "High")) {
        map.set(key, {
          skill: canonical,
          evidence: item.evidence || "Demonstrated in profile",
          source: item.source || "profile",
          confidence: item.confidence || 0.85,
          strength: item.strength || "Medium",
        });
      }
    }
  });

  return Array.from(map.values());
};

// Helper to extract text from buffer
const extractTextFromBuffer = async (buffer, mimetype = "") => {
  if (mimetype.includes("pdf") || (buffer.length > 4 && buffer.slice(0, 4).toString() === "%PDF")) {
    try {
      const parser = new PDFParse({ data: buffer });
      await parser.load();
      const text = await parser.getText();
      if (text && text.trim().length > 10) return text;
    } catch (pdfErr) {
      console.warn("PDF parser string fallback used:", pdfErr.message);
    }
  }
  return buffer.toString("utf8");
};

// GET /api/candidate/profile
export const getProfile = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.user.id).select("-password");
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });
    res.json(candidate);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/candidate/profile — update bio, links
export const updateProfile = async (req, res) => {
  try {
    const { bio, profileLinks } = req.body;
    const candidate = await Candidate.findByIdAndUpdate(
      req.user.id,
      { bio, profileLinks },
      { new: true }
    ).select("-password");
    res.json(candidate);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/candidate/profile — permanent deletion of candidate and applications
export const deleteProfile = async (req, res) => {
  try {
    const candidateId = req.user.id;
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) return res.status(404).json({ message: "Candidate profile not found" });

    // Clean up applications
    await Application.deleteMany({ candidate: candidateId });
    // Clean up candidate record
    await Candidate.findByIdAndDelete(candidateId);

    res.json({ message: "Candidate profile and all associated data have been permanently deleted." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/candidate/work-history
export const updateWorkHistory = async (req, res) => {
  try {
    const { workHistory } = req.body;
    const { careerGaps, hasCareerGap, gapDurationMonths } = analyzeGaps(workHistory);

    const candidate = await Candidate.findById(req.user.id);
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });

    candidate.workHistory = workHistory;
    candidate.careerGaps = careerGaps;
    candidate.hasCareerGap = hasCareerGap;
    candidate.gapDurationMonths = gapDurationMonths;

    const workSkills = [];
    workHistory.forEach((job) => {
      if (job.title) {
        workSkills.push({
          skill: normalizeSkill(job.title),
          evidence: `Professional experience as ${job.title} at ${job.company || "organization"}`,
          source: "work_history",
          strength: "Medium",
          confidence: 0.85,
        });
      }
    });

    candidate.skillEvidence = mergeSkillEvidence(candidate.skillEvidence, workSkills);
    await candidate.save();

    const { password, ...safeCandidate } = candidate.toObject();
    res.json(safeCandidate);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/candidate/projects — add or update projects
export const saveProjects = async (req, res) => {
  try {
    const { projects } = req.body;
    const candidate = await Candidate.findById(req.user.id);
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });

    candidate.projects = projects;

    const extractedSkills = [];
    for (const proj of projects) {
      if (proj.technologies && proj.technologies.length > 0) {
        proj.technologies.forEach((tech) => {
          extractedSkills.push({
            skill: normalizeSkill(tech),
            evidence: `Built project "${proj.title}" using ${tech}: ${proj.description || ""}`,
            source: "project",
            strength: "High",
            confidence: 0.9,
          });
        });
      }
    }

    candidate.skillEvidence = mergeSkillEvidence(candidate.skillEvidence, extractedSkills);
    await candidate.save();

    const { password, ...safeCandidate } = candidate.toObject();
    res.json(safeCandidate);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/candidate/certificates — add certificates
export const saveCertificates = async (req, res) => {
  try {
    const { certificates } = req.body;
    const candidate = await Candidate.findById(req.user.id);
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });

    candidate.certificates = certificates;

    const certSkills = [];
    for (const cert of certificates) {
      if (cert.skills && cert.skills.length > 0) {
        cert.skills.forEach((sk) => {
          certSkills.push({
            skill: normalizeSkill(sk),
            evidence: `Certified in ${sk} via "${cert.name}" issued by ${cert.issuer}`,
            source: "certificate",
            strength: "Medium",
            confidence: 0.85,
          });
        });
      }
    }

    candidate.skillEvidence = mergeSkillEvidence(candidate.skillEvidence, certSkills);
    await candidate.save();

    const { password, ...safeCandidate } = candidate.toObject();
    res.json(safeCandidate);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/candidate/resume-upload — upload PDF / DOC / TXT resume file using Eden AI Parser
export const uploadResumeFile = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: "No file uploaded. Please select a PDF or document file." });
    }

    const candidate = await Candidate.findById(req.user.id);
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });

    const extractedRawText = await extractTextFromBuffer(req.file.buffer, req.file.mimetype);
    if (!extractedRawText || extractedRawText.trim().length < 15) {
      return res.status(400).json({ message: "Could not extract legible text from this file. You may also paste text directly." });
    }

    candidate.resumeText = extractedRawText;

    // Use Eden AI Parser
    const parsed = await parseResumeWithEdenAI(
      req.file.buffer,
      req.file.mimetype,
      req.file.originalname || "resume.pdf"
    );

    if (parsed.bio && !candidate.bio) {
      candidate.bio = parsed.bio;
    }

    if (parsed.education?.length > 0) {
      candidate.education = parsed.education;
    }

    if (parsed.skills && parsed.skills.length > 0) {
      const resumeSkills = parsed.skills.map((s) => ({
        skill: normalizeSkill(s.skill),
        evidence: s.evidence || "Extracted from uploaded resume",
        source: "resume",
        strength: s.strength || "Medium",
        confidence: s.confidence || 0.9,
      }));
      candidate.skillEvidence = mergeSkillEvidence(candidate.skillEvidence, resumeSkills);
    }

    // Auto-fill work history if empty
    if ((!candidate.workHistory || candidate.workHistory.length === 0) && parsed.workHistory?.length > 0) {
      candidate.workHistory = parsed.workHistory.map((wh) => ({
        title: wh.title,
        company: wh.company,
        startDate: wh.startDate ? new Date(wh.startDate) : undefined,
        endDate: wh.endDate ? new Date(wh.endDate) : undefined,
        description: wh.description,
      }));
      const { careerGaps, hasCareerGap, gapDurationMonths } = analyzeGaps(candidate.workHistory);
      candidate.careerGaps = careerGaps;
      candidate.hasCareerGap = hasCareerGap;
      candidate.gapDurationMonths = gapDurationMonths;
    }

    // Auto-fill projects if empty
    if ((!candidate.projects || candidate.projects.length === 0) && parsed.projects?.length > 0) {
      candidate.projects = parsed.projects.map((p) => ({
        title: p.title,
        description: p.description,
        technologies: normalizeSkillList(p.technologies || []),
        link: p.link || "",
      }));
    }

    await candidate.save();

    const { password, ...safeCandidate } = candidate.toObject();
    res.json({
      candidate: safeCandidate,
      extractedSkillsCount: (parsed.skills || []).length,
      extractedTextLength: extractedRawText.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/candidate/resume — upload or paste resume text
export const uploadResume = async (req, res) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText || !resumeText.trim()) {
      return res.status(400).json({ message: "Resume text is required" });
    }

    const candidate = await Candidate.findById(req.user.id);
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });

    candidate.resumeText = resumeText;

    // Use deterministic Eden / local structured parser
    const parsed = parseResumeLocally(resumeText);

    if (parsed.bio && !candidate.bio) {
      candidate.bio = parsed.bio;
    }

    if (parsed.education?.length > 0) {
      candidate.education = parsed.education;
    }

    if (parsed.skills && parsed.skills.length > 0) {
      const resumeSkills = parsed.skills.map((s) => ({
        skill: normalizeSkill(s.skill),
        evidence: s.evidence || "Extracted from resume experience",
        source: "resume",
        strength: s.strength || "Medium",
        confidence: s.confidence || 0.9,
      }));
      candidate.skillEvidence = mergeSkillEvidence(candidate.skillEvidence, resumeSkills);
    }

    if ((!candidate.workHistory || candidate.workHistory.length === 0) && parsed.workHistory?.length > 0) {
      candidate.workHistory = parsed.workHistory.map((wh) => ({
        title: wh.title,
        company: wh.company,
        startDate: wh.startDate ? new Date(wh.startDate) : undefined,
        endDate: wh.endDate ? new Date(wh.endDate) : undefined,
        description: wh.description,
      }));
      const { careerGaps, hasCareerGap, gapDurationMonths } = analyzeGaps(candidate.workHistory);
      candidate.careerGaps = careerGaps;
      candidate.hasCareerGap = hasCareerGap;
      candidate.gapDurationMonths = gapDurationMonths;
    }

    if ((!candidate.projects || candidate.projects.length === 0) && parsed.projects?.length > 0) {
      candidate.projects = parsed.projects.map((p) => ({
        title: p.title,
        description: p.description,
        technologies: normalizeSkillList(p.technologies || []),
        link: "",
      }));
    }

    await candidate.save();

    const { password, ...safeCandidate } = candidate.toObject();
    res.json({
      candidate: safeCandidate,
      extractedSkillsCount: (parsed.skills || []).length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==========================================
// DYNAMIC AI INTERVIEW ENDPOINTS
// ==========================================

export const startDynamicInterview = async (req, res) => {
  try {
    const { jobId } = req.body;
    const candidate = await Candidate.findById(req.user.id);
    const job = await Job.findById(jobId);

    if (!job) return res.status(404).json({ message: "Job not found" });

    const demonstratedSkills = (candidate.skillEvidence || []).map((e) => e.skill);
    const missingSkills = (job.requiredSkills || []).filter(
      (reqSkill) => !demonstratedSkills.some((ds) => ds.toLowerCase().includes(reqSkill.toLowerCase()))
    );

    const candidateContext = `Candidate: ${candidate.name}. Has ${candidate.workHistory?.length || 0} past roles. ${
      candidate.hasCareerGap ? `Currently in a career break of ${candidate.gapDurationMonths} months.` : ""
    } Projects count: ${candidate.projects?.length || 0}. Target role: ${job.title}.`;

    const nextQ = await generateNextInterviewQuestion({
      jobTitle: job.title,
      jobDescription: job.description,
      requiredSkills: job.requiredSkills || [],
      candidateContext,
      demonstratedSkills,
      missingSkills,
      interviewHistory: [],
    });

    res.json({
      jobId: job._id,
      jobTitle: job.title,
      questionNumber: 1,
      maxQuestions: 8,
      targetSkill: nextQ.targetSkill || (job.requiredSkills?.[0] || "Core Skills"),
      question: nextQ.question || `Tell me about your hands-on experience with ${job.requiredSkills?.[0] || "this role"}.`,
      shouldContinue: true,
      completed: false,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const submitInterviewTurn = async (req, res) => {
  try {
    const { jobId, question, answer, targetSkill, interviewHistory = [] } = req.body;

    if (!answer || !answer.trim()) {
      return res.status(400).json({ message: "Answer cannot be empty" });
    }

    const candidate = await Candidate.findById(req.user.id);
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const turnAnalysis = await analyzeInterviewAnswer({
      jobTitle: job.title,
      requiredSkills: job.requiredSkills || [],
      targetSkill,
      question,
      answer,
      interviewHistory,
    });

    const updatedHistory = [
      ...interviewHistory,
      {
        question,
        answer,
        targetSkill,
        analysis: turnAnalysis.analysis,
        skills: turnAnalysis.skills || [],
      },
    ];

    const currentQuestionCount = updatedHistory.length;
    const MAX_QUESTIONS = 8;

    if (currentQuestionCount >= MAX_QUESTIONS) {
      return res.json({
        analysis: turnAnalysis.analysis,
        claims: turnAnalysis.claims || [],
        skills: turnAnalysis.skills || [],
        completed: true,
        shouldContinue: false,
        questionNumber: currentQuestionCount,
        maxQuestions: MAX_QUESTIONS,
        message: "Maximum assessment questions reached. Preparing your evaluation.",
        history: updatedHistory,
      });
    }

    if (turnAnalysis.needsFollowUp && turnAnalysis.suggestedFollowUp && currentQuestionCount < 6) {
      return res.json({
        analysis: turnAnalysis.analysis,
        claims: turnAnalysis.claims || [],
        skills: turnAnalysis.skills || [],
        completed: false,
        shouldContinue: true,
        questionNumber: currentQuestionCount + 1,
        maxQuestions: MAX_QUESTIONS,
        targetSkill,
        question: turnAnalysis.suggestedFollowUp,
        history: updatedHistory,
      });
    }

    const demonstratedSkills = [
      ...(candidate.skillEvidence || []).map((e) => e.skill),
      ...updatedHistory.flatMap((h) => (h.skills || []).map((s) => s.name)),
    ];

    const missingSkills = (job.requiredSkills || []).filter(
      (reqSkill) => !demonstratedSkills.some((ds) => ds.toLowerCase().includes(reqSkill.toLowerCase()))
    );

    const nextQ = await generateNextInterviewQuestion({
      jobTitle: job.title,
      jobDescription: job.description,
      requiredSkills: job.requiredSkills || [],
      candidateContext: `Candidate: ${candidate.name}`,
      demonstratedSkills,
      missingSkills,
      interviewHistory: updatedHistory,
    });

    if (nextQ.completed || !nextQ.shouldContinue || !nextQ.question || missingSkills.length === 0) {
      return res.json({
        analysis: turnAnalysis.analysis,
        claims: turnAnalysis.claims || [],
        skills: turnAnalysis.skills || [],
        completed: true,
        shouldContinue: false,
        questionNumber: currentQuestionCount,
        maxQuestions: MAX_QUESTIONS,
        message: "Assessment complete! All necessary skill evidence has been captured.",
        history: updatedHistory,
      });
    }

    return res.json({
      analysis: turnAnalysis.analysis,
      claims: turnAnalysis.claims || [],
      skills: turnAnalysis.skills || [],
      completed: false,
      shouldContinue: true,
      questionNumber: currentQuestionCount + 1,
      maxQuestions: MAX_QUESTIONS,
      targetSkill: nextQ.targetSkill || "Demonstrated Capability",
      question: nextQ.question,
      reasoning: nextQ.reasoning,
      history: updatedHistory,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const completeInterviewSession = async (req, res) => {
  try {
    const { jobId, interviewHistory = [] } = req.body;
    const candidate = await Candidate.findById(req.user.id);
    const job = jobId ? await Job.findById(jobId) : null;

    if (!candidate) return res.status(404).json({ message: "Candidate not found" });

    candidate.breakInterviewAnswers = interviewHistory.map((h) => ({
      question: h.question,
      answer: h.answer,
      targetSkill: h.targetSkill,
      analysis: h.analysis,
    }));

    const extractedSkills = await extractSkillsFromCompleteInterview({
      jobTitle: job?.title || "Professional",
      requiredSkills: job?.requiredSkills || [],
      interviewAnswers: interviewHistory,
    });

    const interviewEvidence = extractedSkills.map((s) => ({
      skill: normalizeSkill(s.name),
      evidence: s.evidence || "Demonstrated in dynamic interview",
      source: "interview",
      strength: s.strength || "High",
      confidence: s.confidence || 0.9,
    }));

    candidate.skillEvidence = mergeSkillEvidence(candidate.skillEvidence, interviewEvidence);

    candidate.extractedSkills = candidate.skillEvidence.map((se) => ({
      name: se.skill,
      source: se.source,
      status: "maintained",
    }));

    await candidate.save();

    const { password, ...safeCandidate } = candidate.toObject();
    res.json(safeCandidate);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Backwards compatible
export const saveInterviewAnswers = async (req, res) => {
  try {
    const { answers } = req.body;
    const candidate = await Candidate.findByIdAndUpdate(
      req.user.id,
      { breakInterviewAnswers: answers },
      { new: true }
    ).select("-password");
    res.json(candidate);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const extractSkills = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.user.id);
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });

    if (!candidate.breakInterviewAnswers || candidate.breakInterviewAnswers.length === 0) {
      return res.status(400).json({ message: "No interview answers found to extract skills from" });
    }

    const rawSkills = await extractSkillsFromInterview(candidate.breakInterviewAnswers);

    const newEvidence = rawSkills.map((s) => ({
      skill: normalizeSkill(s.name),
      evidence: s.source || "Demonstrated during interview",
      source: "interview",
      strength: s.evidenceStrength || "Medium",
      confidence: 0.85,
    }));

    candidate.skillEvidence = mergeSkillEvidence(candidate.skillEvidence, newEvidence);
    candidate.extractedSkills = candidate.skillEvidence.map((se) => ({
      name: se.skill,
      source: se.source,
      status: "maintained",
    }));

    await candidate.save();

    const { password, ...safeCandidate } = candidate.toObject();
    res.json(safeCandidate);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
