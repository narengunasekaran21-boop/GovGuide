import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { adminApi, schemeApi } from "../../api/endpoints";
import PageLoader from "../../components/PageLoader";
import SchemeForm from "./SchemeForm";

const STATUS_STYLE = {
  ACTIVE: "bg-banyan-light text-banyan",
  DRAFT: "bg-sand text-ink/60",
  ARCHIVED: "bg-clay-light text-clay",
};

export default function AdminSchemes() {
  const [schemes, setSchemes] = useState(null);
  const [modalMode, setModalMode] = useState(null); // 'create' | scheme object
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchSchemes = () => {
    adminApi.listAllSchemes().then(({ data }) => setSchemes(data.schemes));
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  const handleCreate = async (data) => {
    setSubmitting(true);
    setError("");
    try {
      await schemeApi.create(data);
      setModalMode(null);
      fetchSchemes();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create scheme.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (data) => {
    setSubmitting(true);
    setError("");
    try {
      await schemeApi.update(modalMode.id, data);
      setModalMode(null);
      fetchSchemes();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update scheme.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (scheme) => {
    if (!confirm(`Delete "${scheme.name}"? This cannot be undone.`)) return;
    await schemeApi.remove(scheme.id);
    fetchSchemes();
  };

  if (!schemes) return <PageLoader />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-ink">All schemes ({schemes.length})</h2>
        <button
          onClick={() => setModalMode("create")}
          className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink-light"
        >
          <Plus className="h-4 w-4" /> New scheme
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-ink/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 bg-sand/40 text-xs uppercase tracking-wide text-slate">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Level</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {schemes.map((s) => (
              <tr key={s.id} className="border-b border-ink/5 last:border-none">
                <td className="px-4 py-3 font-medium text-ink">{s.name}</td>
                <td className="px-4 py-3 text-slate">{s.category}</td>
                <td className="px-4 py-3 text-slate">{s.government_level}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE[s.status]}`}>
                    {s.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setModalMode(s)} className="rounded-lg border border-ink/10 p-1.5 text-slate hover:text-ink">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(s)} className="rounded-lg border border-ink/10 p-1.5 text-slate hover:text-clay">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/50 p-4 py-10">
          <div className="w-full max-w-2xl rounded-2xl bg-paper p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-ink">
                {modalMode === "create" ? "New scheme" : `Edit: ${modalMode.name}`}
              </h3>
              <button onClick={() => setModalMode(null)} className="text-slate hover:text-ink">
                <X className="h-5 w-5" />
              </button>
            </div>
            {error && <div className="mt-4 rounded-lg bg-clay-light px-4 py-3 text-sm text-clay">{error}</div>}
            <div className="mt-5">
              <SchemeForm
                initialValue={modalMode === "create" ? null : modalMode}
                onSubmit={modalMode === "create" ? handleCreate : handleUpdate}
                onCancel={() => setModalMode(null)}
                submitting={submitting}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
