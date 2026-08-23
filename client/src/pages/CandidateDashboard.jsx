import { useState } from "react";
import Navbar from "../components/shared/Navbar";
import WorkHistoryForm from "../components/WorkHistoryForm";
import SkillInterview from "../components/SkillInterview";
import { useAuth } from "../context/AuthContext";

// Three phases: fill work history -> (if gap detected) skill interview -> done
const CandidateDashboard = () => {
  const { user } = useAuth();
  const [candidate, setCandidate] = useState(null);
  const [interviewDone, setInterviewDone] = useState(false);

  const handleWorkHistorySaved = (data) => setCandidate(data);
  const handleInterviewComplete = (data) => {
    setCandidate(data);
    setInterviewDone(true);
  };

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="max-w-xl mx-auto px-6 pt-12 pb-20">
        <h1 className="text-2xl font-semibold text-ink mb-1">
          Welcome, {user?.name}
        </h1>
        <p className="text-sm text-inkSoft mb-8">
          Let's build your skill profile.
        </p>

        {/* Phase 1: work history not saved yet */}
        {!candidate && <WorkHistoryForm onSaved={handleWorkHistorySaved} />}

        {/* Phase 2: work history saved, gap detected, interview not done yet */}
        {candidate && candidate.hasCareerGap && !interviewDone && (
          <div>
            <div className="bg-accentLight border border-accent/20 rounded-lg p-4 mb-6 text-sm text-ink">
              We noticed a {candidate.gapDurationMonths}-month gap in your work
              history. A few quick questions will help us find the skills you
              built during that time.
            </div>
            <SkillInterview onComplete={handleInterviewComplete} />
          </div>
        )}

        {/* Phase 2b: no gap detected — nothing more needed right now */}
        {candidate && !candidate.hasCareerGap && !interviewDone && (
          <p className="text-sm text-inkSoft">
            No career gap detected — you're all set. Job matching is coming
            soon.
          </p>
        )}

        {/* Phase 3: interview complete */}
        {interviewDone && (
          <p className="text-sm text-positive font-medium">
            Interview complete — {candidate.extractedSkills?.length || 0} skills
            captured. Skill extraction is coming in Step 7.
          </p>
        )}
      </div>
    </div>
  );
};

export default CandidateDashboard;
