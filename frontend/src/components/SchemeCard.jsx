import { Link } from "react-router-dom";
import { Bookmark, BookmarkCheck, MapPin, Landmark } from "lucide-react";

export default function SchemeCard({ scheme, isBookmarked, onToggleBookmark, canBookmark }) {
  return (
    <div className="group flex flex-col rounded-2xl border border-ink/10 bg-white p-5 transition-shadow hover:shadow-[0_4px_24px_-4px_rgba(27,42,74,0.12)]">
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex items-center gap-1 rounded-full bg-sand px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink/70">
          {scheme.category}
        </span>
        {canBookmark && (
          <button
            aria-label={isBookmarked ? "Remove bookmark" : "Save scheme"}
            onClick={() => onToggleBookmark(scheme)}
            className="text-slate-light hover:text-marigold-dark"
          >
            {isBookmarked ? (
              <BookmarkCheck className="h-5 w-5 text-marigold-dark" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </button>
        )}
      </div>

      <h3 className="mt-3 font-display text-lg font-semibold leading-snug text-ink">
        <Link to={`/schemes/${scheme.id}`} className="hover:underline decoration-marigold decoration-2 underline-offset-2">
          {scheme.name}
        </Link>
      </h3>

      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate">{scheme.description}</p>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate">
        <span className="inline-flex items-center gap-1">
          <Landmark className="h-3.5 w-3.5" />
          {scheme.government_level === "CENTRAL" ? "Central Govt." : "State Govt."}
        </span>
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {scheme.state}
        </span>
      </div>

      {scheme.benefit_summary && (
        <div className="mt-4 rounded-lg bg-banyan-light px-3 py-2 text-sm font-medium text-banyan">
          {scheme.benefit_summary}
        </div>
      )}

      <Link
        to={`/schemes/${scheme.id}`}
        className="mt-4 inline-flex items-center justify-center rounded-full border border-ink/15 py-2 text-sm font-medium text-ink transition-colors group-hover:border-ink group-hover:bg-ink group-hover:text-paper"
      >
        View details
      </Link>
    </div>
  );
}
