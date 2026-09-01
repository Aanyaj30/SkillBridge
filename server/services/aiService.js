// SkillBridge Central AI Service Layer
// Serves as the high-level coordinator across specialized agents:
// - Job Analysis Agent
// - Candidate Evidence Agent
// - Skill Assessment / Interview Agent
// - Matching / Evaluation Agent
// - Guide Agent
//
// All underlying LLM communication is abstracted behind aiProvider.js
// so that SAP Generative AI Hub can be plugged in seamlessly in the future.

import { analyzeJobDescription as jobAgentAnalyze } from "./agents/jobAnalysisAgent.js";
import {
  extractCandidateEvidence as candidateAgentExtract,
  extractProjectSkills as candidateAgentProject,
  parseResumeContent as candidateAgentResume,
} from "./agents/candidateEvidenceAgent.js";
import {
  generateNextInterviewQuestion as interviewAgentNextQuestion,
  analyzeInterviewAnswer as interviewAgentAnalyzeTurn,
  extractSkillsFromCompleteInterview as interviewAgentFinalExtract,
} from "./agents/skillInterviewAgent.js";
import { evaluateMatchEvidence as matchingAgentEvaluate } from "./agents/matchingAgent.js";
import { generatePersonalizedGuide as guideAgentGenerate } from "./agents/guideAgent.js";

// ==========================================
// 1. JOB ANALYSIS AGENT EXPORTS
// ==========================================

export const extractRequiredSkillsFromDescription = async (description, title = "") => {
  const result = await jobAgentAnalyze(description, title);
  return result.requiredSkills || [];
};

export const analyzeJobPosting = async (description, title = "") => {
  return await jobAgentAnalyze(description, title);
};

// ==========================================
// 2. CANDIDATE EVIDENCE AGENT EXPORTS
// ==========================================

export const extractCandidateEvidence = async (candidateData) => {
  return await candidateAgentExtract(candidateData);
};

export const extractProjectSkills = async (projectData) => {
  return await candidateAgentProject(projectData);
};

export const parseResumeContent = async (resumeText) => {
  return await candidateAgentResume(resumeText);
};

// ==========================================
// 3. SKILL ASSESSMENT / INTERVIEW AGENT EXPORTS
// ==========================================

export const generateNextInterviewQuestion = async (params) => {
  return await interviewAgentNextQuestion(params);
};

export const analyzeInterviewAnswer = async (params) => {
  return await interviewAgentAnalyzeTurn(params);
};

export const extractSkillsFromInterview = async (interviewAnswers, jobTitle = "Professional") => {
  return await interviewAgentFinalExtract({
    jobTitle,
    interviewAnswers,
  });
};

export const extractSkillsFromCompleteInterview = async (params) => {
  return await interviewAgentFinalExtract(params);
};

// ==========================================
// 4. MATCHING / EVALUATION AGENT EXPORTS
// ==========================================

export const evaluateMatchEvidence = async (params) => {
  return await matchingAgentEvaluate(params);
};

// ==========================================
// 5. GUIDE AGENT EXPORTS
// ==========================================

export const generateCandidateGuide = async (params) => {
  return await guideAgentGenerate(params);
};

export const generatePersonalizedGuide = async (params) => {
  return await guideAgentGenerate(params);
};
