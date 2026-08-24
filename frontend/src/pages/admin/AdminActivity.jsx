import { useEffect, useState } from "react";
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

const ACTION_STYLE = {
  UNAUTHORIZED_ACCESS_ATTEMPT: "bg-clay-light text-clay",
  SCHEME_DELETED: "bg-clay-light text-clay",
  USER_STATUS_CHANGED: "bg-marigold/15 text-marigold-dark",
  SCHEME_CREATED: "bg-banyan-light text-banyan",
  SCHEME_UPDATED: "bg-banyan-light text-banyan",
};

export default function AdminActivity() {
  const [logs, setLogs] = useState(null);

  useEffect(() => {
    adminApi.activityLogs(100).then(({ data }) => setLogs(data.logs));
  }, []);

  if (!logs) return <PageLoader />;

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-ink">Activity log</h2>
      <p className="mt-1 text-sm text-slate">
        A record of authentication, scheme, and administrative events — including blocked
        unauthorized access attempts — for audit purposes.
      </p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-ink/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 bg-sand/40 text-xs uppercase tracking-wide text-slate">
            <tr>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Detail</th>
              <th className="px-4 py-3">Time</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-ink/5 last:border-none">
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ACTION_STYLE[log.action] || "bg-sand text-ink/60"}`}>
                    {ACTION_LABEL[log.action] || log.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink">
                  {log.user_name ? (
                    <>
                      {log.user_name}
                      <span className="block text-xs text-slate-light">{log.user_email}</span>
                    </>
                  ) : (
                    <span className="text-slate-light">System</span>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate">{log.detail || "—"}</td>
                <td className="px-4 py-3 text-xs text-slate">{new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-light">No activity recorded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
