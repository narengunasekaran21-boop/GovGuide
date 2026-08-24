import { useEffect, useState } from "react";
import { Search, ShieldOff, ShieldCheck } from "lucide-react";
import { adminApi } from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import PageLoader from "../../components/PageLoader";

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState(null);
  const [search, setSearch] = useState("");

  const fetchUsers = (q) => {
    adminApi.listUsers(q).then(({ data }) => setUsers(data.users));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchUsers(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const toggleStatus = async (u) => {
    const next = u.status === "ACTIVE" ? "DISABLED" : "ACTIVE";
    if (!confirm(`${next === "DISABLED" ? "Disable" : "Re-activate"} ${u.email}?`)) return;
    await adminApi.setUserStatus(u.id, next);
    fetchUsers(search);
  };

  if (!users) return <PageLoader />;

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-xl font-semibold text-ink">All users ({users.length})</h2>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-light" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email…"
            className="rounded-full border border-ink/15 bg-white py-2 pl-8 pr-3 text-sm outline-none focus:border-marigold-dark"
          />
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-ink/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 bg-sand/40 text-xs uppercase tracking-wide text-slate">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-ink/5 last:border-none">
                <td className="px-4 py-3 font-medium text-ink">{u.name}</td>
                <td className="px-4 py-3 text-slate">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${u.role === "ADMIN" ? "bg-ink text-marigold" : "bg-sand text-ink/60"}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${u.status === "ACTIVE" ? "bg-banyan-light text-banyan" : "bg-clay-light text-clay"}`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  {u.id === currentUser.id ? (
                    <span className="text-xs text-slate-light">You</span>
                  ) : (
                    <button
                      onClick={() => toggleStatus(u)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-ink/10 px-2.5 py-1.5 text-xs font-medium text-slate hover:text-ink"
                    >
                      {u.status === "ACTIVE" ? <ShieldOff className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                      {u.status === "ACTIVE" ? "Disable" : "Re-activate"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
