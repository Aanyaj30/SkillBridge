import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createJob,
  getJobs,
  getJobById,
} from "../controllers/jobController.js";

const router = express.Router();

router.post("/", protect, createJob);
router.get("/", protect, getJobs);
router.get("/:id", protect, getJobById);

export default router;
