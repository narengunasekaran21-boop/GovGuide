import { useState } from "react";
import { Plus, X } from "lucide-react";

const CATEGORIES = [
  "Education", "Employment", "Agriculture", "Healthcare",
  "Women & Child Welfare", "Senior Citizens", "Housing", "Financial Assistance",
];

const emptyForm = {
  name: "", description: "", category: CATEGORIES[0],
  benefits: [""], eligibility: [""], documents: [""], application_steps: [""],
  government_level: "CENTRAL", state: "All India", benefit_summary: "",
  min_age: "", max_age: "", max_income: "", gender: "ANY", status: "ACTIVE",
};

function ListFieldEditor({ label, values, onChange }) {
  const update = (i, val) => {
    const next = [...values];
    next[i] = val;
    onChange(next);
  };
  const add = () => onChange([...values, ""]);
  const remove = (i) => onChange(values.filter((_, idx) => idx !== i));

  return (
    <div>
      <label className="block text-sm font-medium text-ink">{label}</label>
      <div className="mt-1.5 space-y-2">
        {values.map((v, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={v}
              onChange={(e) => update(i, e.target.value)}
              className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-marigold-dark focus:ring-2 focus:ring-marigold/30"
            />
            <button type="button" onClick={() => remove(i)} className="shrink-0 rounded-lg border border-ink/10 px-2 text-slate hover:text-clay">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button type="button" onClick={add} className="flex items-center gap-1 text-xs font-medium text-ink/70 hover:text-ink">
          <Plus className="h-3.5 w-3.5" /> Add item
        </button>
      </div>
    </div>
  );
}

export default function SchemeForm({ initialValue, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(() =>
    initialValue
      ? {
          ...emptyForm,
          ...initialValue,
          min_age: initialValue.min_age ?? "",
          max_age: initialValue.max_age ?? "",
          max_income: initialValue.max_income ?? "",
        }
      : emptyForm
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      benefits: form.benefits.filter(Boolean),
      eligibility: form.eligibility.filter(Boolean),
      documents: form.documents.filter(Boolean),
      application_steps: form.application_steps.filter(Boolean),
      min_age: form.min_age === "" ? null : Number(form.min_age),
      max_age: form.max_age === "" ? null : Number(form.max_age),
      max_income: form.max_income === "" ? null : Number(form.max_income),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-ink">Scheme name</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1.5 w-full rounded-lg border border-ink/15 px-3.5 py-2.5 text-sm outline-none focus:border-marigold-dark focus:ring-2 focus:ring-marigold/30"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-ink">Description</label>
          <textarea
            required
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="mt-1.5 w-full rounded-lg border border-ink/15 px-3.5 py-2.5 text-sm outline-none focus:border-marigold-dark focus:ring-2 focus:ring-marigold/30"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink">Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="mt-1.5 w-full rounded-lg border border-ink/15 px-3.5 py-2.5 text-sm"
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink">Government level</label>
          <select
            value={form.government_level}
            onChange={(e) => setForm({ ...form, government_level: e.target.value })}
            className="mt-1.5 w-full rounded-lg border border-ink/15 px-3.5 py-2.5 text-sm"
          >
            <option value="CENTRAL">Central</option>
            <option value="STATE">State</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink">State</label>
          <input
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
            className="mt-1.5 w-full rounded-lg border border-ink/15 px-3.5 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink">Benefit summary (short)</label>
          <input
            value={form.benefit_summary || ""}
            onChange={(e) => setForm({ ...form, benefit_summary: e.target.value })}
            placeholder="e.g. Up to ₹50,000"
            className="mt-1.5 w-full rounded-lg border border-ink/15 px-3.5 py-2.5 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink">Min age</label>
          <input type="number" value={form.min_age} onChange={(e) => setForm({ ...form, min_age: e.target.value })}
            className="mt-1.5 w-full rounded-lg border border-ink/15 px-3.5 py-2.5 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink">Max age</label>
          <input type="number" value={form.max_age} onChange={(e) => setForm({ ...form, max_age: e.target.value })}
            className="mt-1.5 w-full rounded-lg border border-ink/15 px-3.5 py-2.5 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink">Max household income (₹)</label>
          <input type="number" value={form.max_income} onChange={(e) => setForm({ ...form, max_income: e.target.value })}
            className="mt-1.5 w-full rounded-lg border border-ink/15 px-3.5 py-2.5 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink">Gender restriction</label>
          <select
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
            className="mt-1.5 w-full rounded-lg border border-ink/15 px-3.5 py-2.5 text-sm"
          >
            <option value="ANY">Any</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
        </div>

        {initialValue && (
          <div>
            <label className="block text-sm font-medium text-ink">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-ink/15 px-3.5 py-2.5 text-sm"
            >
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        )}
      </div>

      <ListFieldEditor label="Benefits" values={form.benefits} onChange={(v) => setForm({ ...form, benefits: v })} />
      <ListFieldEditor label="Eligibility criteria" values={form.eligibility} onChange={(v) => setForm({ ...form, eligibility: v })} />
      <ListFieldEditor label="Documents required" values={form.documents} onChange={(v) => setForm({ ...form, documents: v })} />
      <ListFieldEditor label="Application steps" values={form.application_steps} onChange={(v) => setForm({ ...form, application_steps: v })} />

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="rounded-lg border border-ink/15 px-5 py-2.5 text-sm font-medium text-ink">
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-paper disabled:opacity-60">
          {submitting ? "Saving…" : initialValue ? "Save changes" : "Create scheme"}
        </button>
      </div>
    </form>
  );
}
