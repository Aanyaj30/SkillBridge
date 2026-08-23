import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import candidateRoutes from "./routes/candidateRoutes.js";

dotenv.config(); // loads variables from .env into process.env

connectDB(); // connect to MongoDB before anything else

const app = express();

app.use(cors()); // allows our React frontend (different port) to call this API
app.use(express.json()); // lets Express read JSON request bodies

// Test route — just to prove the server is alive and responding
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "SkillBridge server is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/candidate", candidateRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
