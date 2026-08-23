import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import Navbar from "../components/shared/Navbar";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Signup = () => {
  const [searchParams] = useSearchParams();
  const initialRole =
    searchParams.get("role") === "employer" ? "employer" : "candidate";

  const [role, setRole] = useState(initialRole);
  const [form, setForm] = useState({
    name: "",
    companyName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint =
        role === "candidate"
          ? "/auth/candidate/register"
          : "/auth/employer/register";
      const payload =
        role === "candidate"
          ? { name: form.name, email: form.email, password: form.password }
          : {
              companyName: form.companyName,
              email: form.email,
              password: form.password,
            };

      const { data } = await api.post(endpoint, payload);
      login({ ...data, role });
      navigate(
        role === "candidate" ? "/candidate/dashboard" : "/employer/dashboard",
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="max-w-sm mx-auto px-6 pt-16">
        <h1 className="text-2xl font-semibold text-ink text-center mb-2">
          Create your account
        </h1>
        <p className="text-sm text-inkSoft text-center mb-8">
          {role === "candidate"
            ? "Find roles that match your real skills."
            : "Find talent your old ATS was missing."}
        </p>

        {/* Role toggle */}
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
          {role === "candidate" ? (
            <input
              type="text"
              name="name"
              placeholder="Full name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors"
            />
          ) : (
            <input
              type="text"
              name="companyName"
              placeholder="Company name"
              value={form.companyName}
              onChange={handleChange}
              required
              className="w-full border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors"
            />
          )}
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
            minLength={6}
            className="w-full border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors"
          />

          {error && <p className="text-sm text-warning">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-white py-2.5 rounded-md text-sm font-medium hover:bg-accent/90 transition-colors shadow-soft disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-sm text-inkSoft text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-accent font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
