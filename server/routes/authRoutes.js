import express from "express";
import {
  registerCandidate,
  loginCandidate,
  registerEmployer,
  loginEmployer,
  deleteUserAccount,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/candidate/register", registerCandidate);
router.post("/candidate/login", loginCandidate);
router.post("/employer/register", registerEmployer);
router.post("/employer/login", loginEmployer);
router.delete("/profile", protect, deleteUserAccount);

export default router;
