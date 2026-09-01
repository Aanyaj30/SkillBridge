import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const DeleteProfileModal = ({ isOpen, onClose }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (!confirmed) return;
    setDeleting(true);
    setError("");

    try {
      await api.delete("/auth/profile");
      logout();
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Delete profile error:", err);
      setError(err.response?.data?.message || "Failed to delete account. Please try again.");
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-red-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-fadeIn">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5 text-red-600">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="text-base font-bold text-ink">Delete Profile & Data</h3>
              <p className="text-xs text-inkSoft">Permanent and irreversible action</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={deleting}
            className="text-inkSoft hover:text-ink text-sm font-semibold p-1"
          >
            ✕
          </button>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-xs text-red-900 leading-relaxed space-y-1.5">
          <p className="font-semibold">
            Are you sure you want to delete your {user?.companyName ? "company account" : "candidate profile"} ({user?.name || user?.companyName})?
          </p>
          <p className="text-[11px] text-red-800">
            This will permanently remove your stored resume data, projects, verified skill evidence repository, and all submitted job applications. This data cannot be recovered.
          </p>
        </div>

        <label className="flex items-center gap-2 text-xs font-semibold text-ink cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="rounded border-border text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
          />
          <span>I understand that this action is permanent and cannot be undone.</span>
        </label>

        {error && (
          <div className="bg-red-100 text-red-700 text-xs p-2.5 rounded-lg font-medium">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="text-xs font-semibold text-inkSoft hover:text-ink px-4 py-2 rounded-xl"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={!confirmed || deleting}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-soft disabled:opacity-50 flex items-center gap-2"
          >
            {deleting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Deleting Profile...
              </>
            ) : (
              <>Permanently Delete Profile</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteProfileModal;
