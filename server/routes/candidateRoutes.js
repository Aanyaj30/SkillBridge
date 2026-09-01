import express from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import {
  getProfile,
  updateProfile,
  deleteProfile,
  updateWorkHistory,
  saveProjects,
  saveCertificates,
  uploadResume,
  uploadResumeFile,
  startDynamicInterview,
  submitInterviewTurn,
  completeInterviewSession,
  saveInterviewAnswers,
  extractSkills,
} from "../controllers/candidateController.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Candidate Profile & Evidence
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.delete("/profile", protect, deleteProfile);
router.put("/work-history", protect, updateWorkHistory);
router.post("/projects", protect, saveProjects);
router.post("/certificates", protect, saveCertificates);
router.post("/resume", protect, uploadResume);
router.post("/resume-upload", protect, upload.single("file"), uploadResumeFile);

// Dynamic AI Interview Flow
router.post("/interview/start", protect, startDynamicInterview);
router.post("/interview/answer", protect, submitInterviewTurn);
router.post("/interview/complete", protect, completeInterviewSession);

// Backwards-compatible routes
router.post("/interview-answers", protect, saveInterviewAnswers);
router.post("/extract-skills", protect, extractSkills);

export default router;
