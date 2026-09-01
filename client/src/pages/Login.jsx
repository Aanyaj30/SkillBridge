import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/shared/Navbar";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [role, setRole] = useState("candidate");
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { user, login } = useAuth();

  useEffect(() => {
    if (user) {
      navigate(user.name ? "/candidate/dashboard" : "/employer/dashboard", {
        replace: true,
      });
    }
  }, [user, navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint =
        role === "candidate" ? "/auth/candidate/login" : "/auth/employer/login";
      const { data } = await api.post(endpoint, form);
      login({ ...data, role });
      navigate(
        role === "candidate" ? "/candidate/dashboard" : "/employer/dashboard",
      );
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="max-w-sm mx-auto px-6 pt-16">
        <h1 className="text-2xl font-semibold text-ink text-center mb-8">
          Welcome back
        </h1>

        <div className="flex bg-white border border-border rounded-md p-1 mb-6">
          {["candidate", "employer"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 text-sm py-2 rounded transition-colors ${
                role === r
                  ? "bg-accent text-white"
                  : "text-inkSoft hover:text-ink"
              }`}
            >
              {r === "candidate" ? "Candidate" : "Employer"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors"
          />

          {error && <p className="text-sm text-warning">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-white py-2.5 rounded-md text-sm font-medium hover:bg-accent/90 transition-colors shadow-soft disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="text-sm text-inkSoft text-center mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="text-accent font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
