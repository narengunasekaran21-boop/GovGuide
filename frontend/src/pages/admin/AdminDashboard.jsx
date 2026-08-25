import { useEffect, useState } from "react";
import { Users2, FileStack, Bookmark, Activity } from "lucide-react";
import { adminApi } from "../../api/endpoints";
import PageLoader from "../../components/PageLoader";

const ACTION_LABEL = {
  USER_REGISTERED: "New user registered",
  USER_LOGIN: "User logged in",
  ADMIN_LOGIN: "Admin logged in",
  SCHEME_CREATED: "Scheme created",
  SCHEME_UPDATED: "Scheme updated",
  SCHEME_DELETED: "Scheme deleted",
  SCHEME_BOOKMARKED: "Scheme bookmarked",
  USER_STATUS_CHANGED: "User status changed",
  UNAUTHORIZED_ACCESS_ATTEMPT: "Blocked unauthorized access attempt",
  ELIGIBILITY_CHECK_RUN: "Eligibility check run",
};

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    adminApi.dashboard().then(({ data }) => setData(data)).catch(() => setData({}));
  }, []);

  if (!data) return <PageLoader />;

  const stats = [
    { label: "Total users", value: data.totalUsers ?? 0, icon: Users2 },
    { label: "Active schemes", value: data.totalSchemes ?? 0, icon: FileStack },
    { label: "Bookmarks saved", value: data.totalBookmarks ?? 0, icon: Bookmark },
  ];

  const schemesByCategory = Array.isArray(data.schemesByCategory) ? data.schemesByCategory : [];
  const recentActivity = Array.isArray(data.recentActivity) ? data.recentActivity : [];

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-ink/10 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate">{label}</p>
              <Icon className="h-4 w-4 text-marigold-dark" />
            </div>
            <p className="mt-2 font-display text-3xl font-semibold text-ink">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-ink/10 bg-white p-6">
          <h2 className="font-display text-base font-semibold text-ink">Schemes by category</h2>
          <div className="mt-4 space-y-3">
            {schemesByCategory.map((c) => {
              const max = Math.max(...schemesByCategory.map((x) => x.count), 1);
              return (
                <div key={c.category}>
                  <div className="flex justify-between text-xs text-slate">
                    <span>{c.category}</span>
                    <span>{c.count}</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-sand">
                    <div
                      className="h-2 rounded-full bg-marigold"
                      style={{ width: `${(c.count / max) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-ink/10 bg-white p-6">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-marigold-dark" />
            <h2 className="font-display text-base font-semibold text-ink">Recent activity</h2>
          </div>
          <ul className="mt-4 space-y-3">
            {recentActivity.map((log) => (
              <li key={log.id} className="border-b border-ink/5 pb-3 text-sm last:border-none last:pb-0">
                <p className="font-medium text-ink">{ACTION_LABEL[log.action] || log.action}</p>
                <p className="text-xs text-slate">
                  {log.user_name || "System"} · {new Date(log.timestamp).toLocaleString()}
                </p>
              </li>
            ))}
            {recentActivity.length === 0 && (
              <p className="text-sm text-slate-light">No activity yet.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
