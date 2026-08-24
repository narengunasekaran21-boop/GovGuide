import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, X, LandPlot, Bookmark, LayoutDashboard, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navLink = ({ isActive }) =>
  `text-sm font-medium transition-colors ${
    isActive ? "text-ink" : "text-slate hover:text-ink"
  }`;

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-ink">
            <LandPlot className="h-4.5 w-4.5 text-marigold" strokeWidth={2.25} />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-ink">
            GovGuide
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <NavLink to="/schemes" className={navLink}>Browse schemes</NavLink>
          <NavLink to="/eligibility" className={navLink}>Check eligibility</NavLink>
          {user && !isAdmin && <NavLink to="/bookmarks" className={navLink}>Saved</NavLink>}
          {isAdmin && <NavLink to="/admin" className={navLink}>Admin console</NavLink>}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to={isAdmin ? "/admin" : "/profile"}
                className="flex items-center gap-2 rounded-full bg-sand px-3 py-1.5 text-sm font-medium text-ink hover:bg-sand/70"
              >
                <UserIcon className="h-3.5 w-3.5" />
                {user.name.split(" ")[0]}
                {isAdmin && (
                  <span className="rounded-full bg-ink px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-marigold">
                    Admin
                  </span>
                )}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 text-sm font-medium text-slate hover:border-clay/40 hover:text-clay"
              >
                <LogOut className="h-3.5 w-3.5" />
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="rounded-full px-4 py-1.5 text-sm font-medium text-ink hover:bg-sand">
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-ink px-4 py-1.5 text-sm font-medium text-paper hover:bg-ink-light"
              >
                Create account
              </Link>
            </div>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-ink/10 bg-paper px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <NavLink to="/schemes" className={navLink} onClick={() => setOpen(false)}>Browse schemes</NavLink>
            <NavLink to="/eligibility" className={navLink} onClick={() => setOpen(false)}>Check eligibility</NavLink>
            {user && !isAdmin && (
              <NavLink to="/bookmarks" className={navLink} onClick={() => setOpen(false)}>
                <span className="flex items-center gap-1.5"><Bookmark className="h-3.5 w-3.5" /> Saved</span>
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/admin" className={navLink} onClick={() => setOpen(false)}>
                <span className="flex items-center gap-1.5"><LayoutDashboard className="h-3.5 w-3.5" /> Admin console</span>
              </NavLink>
            )}
            <div className="mt-2 flex flex-col gap-2 border-t border-ink/10 pt-4">
              {user ? (
                <>
                  <Link to={isAdmin ? "/admin" : "/profile"} className={navLink} onClick={() => setOpen(false)}>
                    My profile
                  </Link>
                  <button onClick={handleLogout} className="text-left text-sm font-medium text-clay">
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className={navLink} onClick={() => setOpen(false)}>Log in</Link>
                  <Link to="/register" className={navLink} onClick={() => setOpen(false)}>Create account</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
