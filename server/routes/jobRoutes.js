import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createJob,
  getJobs,
  getMyJobs,
  getJobById,
} from "../controllers/jobController.js";

const router = express.Router();

router.post("/", protect, createJob);
router.get("/", protect, getJobs);
router.get("/my", protect, getMyJobs); // must come BEFORE /:id, or Express reads "my" as an id
router.get("/:id", protect, getJobById);

export default router;
