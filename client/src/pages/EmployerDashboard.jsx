import { useAuth } from "../context/AuthContext";

// Placeholder for now — real dashboard gets built in Step 9.
const EmployerDashboard = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <p className="text-ink">
        Welcome, {user?.companyName}. Employer dashboard coming later.
      </p>
    </div>
  );
};

export default EmployerDashboard;
