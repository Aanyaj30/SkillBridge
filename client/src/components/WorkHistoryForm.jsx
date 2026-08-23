import { useState } from "react";
import api from "../services/api";

const emptyEntry = { title: "", company: "", startDate: "", endDate: "" };

// Candidate fills in their past jobs here. On submit, the backend
// auto-detects any 6+ month gap and tells us whether to show the
// skill interview next.
const WorkHistoryForm = ({ onSaved }) => {
  const [entries, setEntries] = useState([{ ...emptyEntry }]);
  const [loading, setLoading] = useState(false);

  const updateEntry = (index, field, value) => {
    const updated = [...entries];
    updated[index][field] = value;
    setEntries(updated);
  };

  const addEntry = () => setEntries([...entries, { ...emptyEntry }]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put("/candidate/work-history", {
        workHistory: entries,
      });
      onSaved(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {entries.map((entry, i) => (
        <div
          key={i}
          className="bg-white border border-border rounded-lg p-5 space-y-3"
        >
          <input
            placeholder="Job title"
            value={entry.title}
            onChange={(e) => updateEntry(i, "title", e.target.value)}
            required
            className="w-full border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent"
          />
          <input
            placeholder="Company"
            value={entry.company}
            onChange={(e) => updateEntry(i, "company", e.target.value)}
            required
            className="w-full border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent"
          />
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-inkSoft">Start date</label>
              <input
                type="date"
                value={entry.startDate}
                onChange={(e) => updateEntry(i, "startDate", e.target.value)}
                required
                className="w-full border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-inkSoft">
                End date (leave blank if current)
              </label>
              <input
                type="date"
                value={entry.endDate}
                onChange={(e) => updateEntry(i, "endDate", e.target.value)}
                className="w-full border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent"
              />
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addEntry}
        className="text-sm text-accent font-medium hover:underline"
      >
        + Add another job
      </button>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-accent text-white py-2.5 rounded-md text-sm font-medium hover:bg-accent/90 transition-colors shadow-soft disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save work history"}
      </button>
    </form>
  );
};

export default WorkHistoryForm;
