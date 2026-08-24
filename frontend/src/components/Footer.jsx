import { Link } from "react-router-dom";
import { LandPlot } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-ink/10 bg-ink text-paper/80">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-marigold">
                <LandPlot className="h-4 w-4 text-ink" strokeWidth={2.25} />
              </span>
              <span className="font-display text-base font-semibold text-paper">GovGuide</span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-paper/60">
              A student project demonstrating secure, role-based access to public welfare
              scheme information. Not an official government service.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-paper/40">Explore</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/schemes" className="hover:text-marigold">Browse schemes</Link></li>
              <li><Link to="/eligibility" className="hover:text-marigold">Check eligibility</Link></li>
              <li><Link to="/register" className="hover:text-marigold">Create an account</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-paper/40">About this project</p>
            <ul className="mt-3 space-y-2 text-sm text-paper/60">
              <li>23CY506 — Web Exploitation &amp; Defence</li>
              <li>Built with React, Express &amp; SQLite</li>
              <li>Demo data only — no real applications processed</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-paper/10 pt-6 text-xs text-paper/40">
          © {new Date().getFullYear()} GovGuide. Academic demonstration project.
        </div>
      </div>
    </footer>
  );
}
