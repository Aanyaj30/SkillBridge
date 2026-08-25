import { Link } from "react-router-dom";
import Navbar from "../components/shared/Navbar";
import { useAuth } from "../context/AuthContext";

const EmployerDashboard = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="max-w-xl mx-auto px-6 pt-12">
        <h1 className="text-2xl font-semibold text-ink mb-1">
          Welcome, {user?.companyName}
        </h1>
        <p className="text-sm text-inkSoft mb-8">
          Candidate pipeline view coming in Step 9.
        </p>
        <Link
          to="/post-job"
          className="inline-block bg-accent text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-accent/90 transition-colors shadow-soft"
        >
          Post a job
        </Link>
      </div>
    </div>
  );
};

export default EmployerDashboard;
