import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowLeft, CheckCircle2, RotateCcw } from "lucide-react";
import { schemeApi } from "../api/endpoints";
import SchemeCard from "../components/SchemeCard";
import { useAuth } from "../context/AuthContext";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
  "Ladakh", "Lakshadweep", "Puducherry",
];

const OCCUPATIONS = [
  { value: "student", label: "Student" },
  { value: "farmer", label: "Farmer / agricultural worker" },
  { value: "job_seeker", label: "Job seeker / unemployed" },
  { value: "self_employed", label: "Self-employed" },
  { value: "entrepreneur", label: "Business owner / entrepreneur" },
  { value: "retired", label: "Retired" },
  { value: "any", label: "Other" },
];

const STEPS = ["Basics", "Income & occupation", "Results"];

export default function Eligibility() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ age: "", gender: "ANY", state: "", annualIncome: "", occupation: "" });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const canProceedStep0 = form.age !== "" && Number(form.age) > 0;
  const canSubmit = form.annualIncome !== "" && form.occupation !== "";

  const runCheck = async () => {
    setLoading(true);
    try {
      const { data } = await schemeApi.checkEligibility({
        age: Number(form.age),
        annualIncome: Number(form.annualIncome),
        occupation: form.occupation,
        gender: form.gender,
        state: form.state || undefined,
      });
      setResults(data);
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setForm({ age: "", gender: "ANY", state: "", annualIncome: "", occupation: "" });
    setResults(null);
    setStep(0);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-widest text-marigold-dark">Eligibility checker</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-ink">See what you qualify for</h1>
      <p className="mt-2 text-sm text-slate">A quick, private estimate — nothing here is submitted as an application.</p>

      {/* Step indicator */}
      <div className="mt-8 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-semibold ${
                i <= step ? "bg-ink text-paper" : "bg-sand text-slate-light"
              }`}
            >
              {i + 1}
            </div>
            <span className={`hidden text-xs font-medium sm:block ${i <= step ? "text-ink" : "text-slate-light"}`}>{label}</span>
            {i < STEPS.length - 1 && <div className={`h-px flex-1 ${i < step ? "bg-ink" : "bg-sand"}`} />}
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-ink/10 bg-white p-6 sm:p-8">
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-ink">Your age</label>
              <input
                type="number"
                min="0"
                max="120"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-ink/15 px-3.5 py-2.5 text-sm outline-none focus:border-marigold-dark focus:ring-2 focus:ring-marigold/30"
                placeholder="e.g. 28"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink">Gender</label>
              <div className="mt-1.5 flex gap-2">
                {[{ v: "ANY", l: "Prefer not to say" }, { v: "MALE", l: "Male" }, { v: "FEMALE", l: "Female" }].map((g) => (
                  <button
                    key={g.v}
                    type="button"
                    onClick={() => setForm({ ...form, gender: g.v })}
                    className={`rounded-full border px-4 py-2 text-sm font-medium ${
                      form.gender === g.v ? "border-ink bg-ink text-paper" : "border-ink/15 text-slate"
                    }`}
                  >
                    {g.l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink">State (optional)</label>
              <select
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-marigold-dark focus:ring-2 focus:ring-marigold/30"
              >
                <option value="">Select your state or UT</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <button
              disabled={!canProceedStep0}
              onClick={() => setStep(1)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-ink py-2.5 text-sm font-semibold text-paper disabled:opacity-40"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-ink">Annual household income (₹)</label>
              <input
                type="number"
                min="0"
                value={form.annualIncome}
                onChange={(e) => setForm({ ...form, annualIncome: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-ink/15 px-3.5 py-2.5 text-sm outline-none focus:border-marigold-dark focus:ring-2 focus:ring-marigold/30"
                placeholder="e.g. 300000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink">Occupation</label>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                {OCCUPATIONS.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setForm({ ...form, occupation: o.value })}
                    className={`rounded-lg border px-3 py-2.5 text-left text-sm font-medium ${
                      form.occupation === o.value ? "border-ink bg-ink text-paper" : "border-ink/15 text-slate"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="flex items-center gap-1.5 rounded-lg border border-ink/15 px-4 py-2.5 text-sm font-medium text-ink">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                disabled={!canSubmit || loading}
                onClick={runCheck}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-ink py-2.5 text-sm font-semibold text-paper disabled:opacity-40"
              >
                {loading ? "Checking…" : "See my results"} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && results && (
          <div>
            <div className="flex items-center gap-2 text-banyan">
              <CheckCircle2 className="h-5 w-5" />
              <p className="font-display text-lg font-semibold">
                You're likely eligible for {results.eligibleCount} scheme{results.eligibleCount === 1 ? "" : "s"}
              </p>
            </div>
            {!user && (
              <p className="mt-2 text-sm text-slate">
                <Link to="/register" className="font-medium text-ink underline decoration-marigold decoration-2 underline-offset-2">Create a free account</Link> to save these results and track your applications.
              </p>
            )}

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {results.eligibleSchemes.map((s) => (
                <SchemeCard key={s.id} scheme={s} canBookmark={false} />
              ))}
            </div>

            {results.eligibleSchemes.length === 0 && (
              <p className="mt-4 rounded-lg bg-sand/50 px-4 py-3 text-sm text-slate">
                No exact matches based on what you entered — try browsing all schemes, some
                eligibility rules depend on details this quick check doesn't capture.
              </p>
            )}

            <button onClick={reset} className="mt-8 flex items-center gap-1.5 text-sm font-medium text-slate hover:text-ink">
              <RotateCcw className="h-3.5 w-3.5" /> Start over
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
