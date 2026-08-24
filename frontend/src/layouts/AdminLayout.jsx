import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, FileStack, Users2, ScrollText } from "lucide-react";

const links = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/schemes", label: "Manage schemes", icon: FileStack },
  { to: "/admin/users", label: "Manage users", icon: Users2 },
  { to: "/admin/activity", label: "Activity log", icon: ScrollText },
];

export default function AdminLayout() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-ink px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-marigold">Admin console</span>
      </div>
      <h1 className="mt-3 font-display text-3xl font-semibold text-ink">Manage GovGuide</h1>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        <nav className="flex shrink-0 gap-2 overflow-x-auto lg:w-56 lg:flex-col lg:overflow-visible">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? "bg-ink text-paper" : "text-slate hover:bg-sand"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
