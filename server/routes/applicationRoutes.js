import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  applyToJob,
  getMyApplications,
  getApplicationsForJob,
} from "../controllers/applicationController.js";

const router = express.Router();

router.post("/apply", protect, applyToJob);
router.get("/my", protect, getMyApplications);
router.get("/job/:jobId", protect, getApplicationsForJob); // used in Step 9

export default router;
