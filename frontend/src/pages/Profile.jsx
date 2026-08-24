import { useState } from "react";
import { User as UserIcon, Save, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { userApi } from "../api/endpoints";

export default function Profile() {
  const { user, refresh } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await userApi.updateProfile(form);
      await refresh();
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sand">
          <UserIcon className="h-5 w-5 text-ink" />
        </span>
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">My profile</h1>
          <p className="text-sm text-slate">{user?.email}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border border-ink/10 bg-white p-6">
        <div>
          <label className="block text-sm font-medium text-ink">Full name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1.5 w-full rounded-lg border border-ink/15 px-3.5 py-2.5 text-sm outline-none focus:border-marigold-dark focus:ring-2 focus:ring-marigold/30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink">Phone number</label>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="Optional"
            className="mt-1.5 w-full rounded-lg border border-ink/15 px-3.5 py-2.5 text-sm outline-none focus:border-marigold-dark focus:ring-2 focus:ring-marigold/30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink">Email address</label>
          <input
            disabled
            value={user?.email || ""}
            className="mt-1.5 w-full cursor-not-allowed rounded-lg border border-ink/10 bg-sand/40 px-3.5 py-2.5 text-sm text-slate-light"
          />
          <p className="mt-1 text-xs text-slate-light">Email cannot be changed for this demo.</p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-paper hover:bg-ink-light disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save changes
        </button>
        {saved && <p className="text-sm text-banyan">Profile updated.</p>}
      </form>
    </div>
  );
}
