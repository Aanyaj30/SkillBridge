import express from "express";
import {
  registerCandidate,
  loginCandidate,
  registerEmployer,
  loginEmployer,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/candidate/register", registerCandidate);
router.post("/candidate/login", loginCandidate);
router.post("/employer/register", registerEmployer);
router.post("/employer/login", loginEmployer);

export default router;
