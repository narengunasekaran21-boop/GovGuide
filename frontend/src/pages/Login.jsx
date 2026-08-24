import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LandPlot, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectAfterLogin = (user) => {
    const from = location.state?.from?.pathname;
    if (user.role === "ADMIN") navigate("/admin");
    else navigate(from && from !== "/login" ? from : "/schemes");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form);
      redirectAfterLogin(user);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <div className="flex justify-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink">
          <LandPlot className="h-5.5 w-5.5 text-marigold" strokeWidth={2.25} />
        </span>
      </div>
      <h1 className="mt-5 text-center font-display text-2xl font-semibold text-ink">Welcome back</h1>
      <p className="mt-1 text-center text-sm text-slate">Log in to save schemes and track your applications.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {error && (
          <div className="rounded-lg bg-clay-light px-4 py-3 text-sm text-clay">{error}</div>
        )}
        <div>
          <label className="block text-sm font-medium text-ink">Email address</label>
          <input
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mt-1.5 w-full rounded-lg border border-ink/15 px-3.5 py-2.5 text-sm outline-none focus:border-marigold-dark focus:ring-2 focus:ring-marigold/30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink">Password</label>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="mt-1.5 w-full rounded-lg border border-ink/15 px-3.5 py-2.5 text-sm outline-none focus:border-marigold-dark focus:ring-2 focus:ring-marigold/30"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-ink py-2.5 text-sm font-semibold text-paper hover:bg-ink-light disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Log in
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate">
        Don't have an account?{" "}
        <Link to="/register" className="font-medium text-ink underline decoration-marigold decoration-2 underline-offset-2">
          Create one
        </Link>
      </p>

      <div className="mt-8 rounded-xl border border-ink/10 bg-sand/50 p-4 text-xs text-slate">
        <p className="font-semibold text-ink">Demo admin account</p>
        <p className="mt-1">Email: admin@govguide.demo · Password: Admin@12345</p>
        <p className="mt-1 text-slate-light">(Seeded for coursework demonstration — change or remove before any real deployment.)</p>
      </div>
    </div>
  );
}
