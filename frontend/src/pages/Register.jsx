import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LandPlot, Loader2, Check, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const PASSWORD_RULES = [
  { key: "length", label: "At least 8 characters", test: (v) => v.length >= 8 },
  { key: "upper", label: "One uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { key: "lower", label: "One lowercase letter", test: (v) => /[a-z]/.test(v) },
  { key: "number", label: "One number", test: (v) => /\d/.test(v) },
  { key: "special", label: "One special character", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);

  const rulesPassed = PASSWORD_RULES.every((r) => r.test(form.password));
  const passwordsMatch = form.password && form.password === form.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    setError("");
    if (!rulesPassed) return setError("Please meet all password requirements.");
    if (!passwordsMatch) return setError("Passwords do not match.");

    setLoading(true);
    try {
      // role is intentionally never sent — the backend always creates USER accounts
      // from this endpoint, regardless of what a client sends.
      await register(form);
      navigate("/schemes");
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
      <h1 className="mt-5 text-center font-display text-2xl font-semibold text-ink">Create your account</h1>
      <p className="mt-1 text-center text-sm text-slate">Save schemes, track eligibility, and apply faster.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {error && <div className="rounded-lg bg-clay-light px-4 py-3 text-sm text-clay">{error}</div>}

        <div>
          <label className="block text-sm font-medium text-ink">Full name</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1.5 w-full rounded-lg border border-ink/15 px-3.5 py-2.5 text-sm outline-none focus:border-marigold-dark focus:ring-2 focus:ring-marigold/30"
          />
        </div>
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
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            onBlur={() => setTouched(true)}
            className="mt-1.5 w-full rounded-lg border border-ink/15 px-3.5 py-2.5 text-sm outline-none focus:border-marigold-dark focus:ring-2 focus:ring-marigold/30"
          />
          {touched && (
            <ul className="mt-2 space-y-1">
              {PASSWORD_RULES.map((r) => {
                const passed = r.test(form.password);
                return (
                  <li key={r.key} className={`flex items-center gap-1.5 text-xs ${passed ? "text-banyan" : "text-slate-light"}`}>
                    {passed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    {r.label}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-ink">Confirm password</label>
          <input
            type="password"
            required
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            className="mt-1.5 w-full rounded-lg border border-ink/15 px-3.5 py-2.5 text-sm outline-none focus:border-marigold-dark focus:ring-2 focus:ring-marigold/30"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-ink py-2.5 text-sm font-semibold text-paper hover:bg-ink-light disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Create account
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-ink underline decoration-marigold decoration-2 underline-offset-2">
          Log in
        </Link>
      </p>
    </div>
  );
}
