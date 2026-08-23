import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getProfile,
  updateWorkHistory,
  saveInterviewAnswers,
} from "../controllers/candidateController.js";

const router = express.Router();

// Every route here requires a valid login token — that's what "protect" does
router.get("/profile", protect, getProfile);
router.put("/work-history", protect, updateWorkHistory);
router.post("/interview-answers", protect, saveInterviewAnswers);

export default router;
