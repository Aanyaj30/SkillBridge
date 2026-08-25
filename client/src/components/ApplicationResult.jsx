// This is the real, data-driven version of the before/after moment you
// already built (as a static demo) on the landing page. Same visual
// language, real numbers this time.
const ApplicationResult = ({ application }) => {
  return (
    <div className="grid md:grid-cols-2 gap-4 mt-4">
      <div className="bg-white border border-border rounded-lg p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-inkSoft mb-3">
          Traditional ATS
        </p>
        <p className="text-4xl font-semibold text-warning">
          {application.baselineMatchScore}%
        </p>
      </div>
      <div className="bg-white border border-accent/25 rounded-lg p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent mb-3">
          With SkillBridge
        </p>
        <p className="text-4xl font-semibold text-positive">
          {application.matchScore}%
        </p>
      </div>

      <div className="md:col-span-2 bg-white border border-border rounded-lg p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-inkSoft mb-3">
          Matched skills
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {application.matchedSkills.length > 0 ? (
            application.matchedSkills.map((s) => (
              <span
                key={s}
                className="bg-positiveLight text-positive text-xs font-medium px-3 py-1.5 rounded-full"
              >
                {s}
              </span>
            ))
          ) : (
            <p className="text-sm text-inkSoft">No direct matches yet.</p>
          )}
        </div>

        {application.skillsNeedingRefresh.length > 0 && (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide text-inkSoft mb-3">
              Skills to build
            </p>
            <div className="flex flex-wrap gap-2">
              {application.skillsNeedingRefresh.map((s) => (
                <span
                  key={s}
                  className="bg-warningLight text-warning text-xs font-medium px-3 py-1.5 rounded-full"
                >
                  {s}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ApplicationResult;
