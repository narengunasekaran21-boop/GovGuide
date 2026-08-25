import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Bookmark, BookmarkCheck, MapPin, Landmark, CheckCircle2,
  FileText, ListChecks, ExternalLink, ArrowLeft,
} from "lucide-react";
import { schemeApi, bookmarkApi } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import PageLoader from "../components/PageLoader";

export default function SchemeDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    schemeApi
      .getById(id)
      .then(({ data }) => setScheme(data.scheme))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleBookmark = async () => {
    if (!user || !scheme) return;
    setSaving(true);
    try {
      if (scheme.isBookmarked) {
        await bookmarkApi.remove(scheme.id);
      } else {
        await bookmarkApi.add(scheme.id);
      }
      setScheme((s) => ({ ...s, isBookmarked: !s.isBookmarked }));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  if (notFound || !scheme) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <p className="font-display text-2xl font-semibold text-ink">Scheme not found</p>
        <p className="mt-2 text-sm text-slate">It may have been removed or the link is incorrect.</p>
        <Link to="/schemes" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink hover:text-marigold-dark">
          <ArrowLeft className="h-4 w-4" /> Back to all schemes
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link to="/schemes" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back to all schemes
      </Link>

      <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <span className="inline-flex items-center gap-1 rounded-full bg-sand px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink/70">
            {scheme.category}
          </span>
          <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-ink">{scheme.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate">
            <span className="inline-flex items-center gap-1.5"><Landmark className="h-4 w-4" /> {scheme.government_level === "CENTRAL" ? "Central Government" : "State Government"}</span>
            <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {scheme.state}</span>
          </div>
        </div>

        {user ? (
          <button
            onClick={toggleBookmark}
            disabled={saving}
            className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors ${
              scheme.isBookmarked
                ? "border-marigold-dark bg-marigold/10 text-marigold-dark"
                : "border-ink/15 text-ink hover:border-ink/30"
            }`}
          >
            {scheme.isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            {scheme.isBookmarked ? "Saved" : "Save scheme"}
          </button>
        ) : (
          <Link
            to="/login"
            className="shrink-0 rounded-full border border-ink/15 px-4 py-2.5 text-sm font-medium text-ink hover:border-ink/30"
          >
            Log in to save
          </Link>
        )}
      </div>

      {scheme.benefit_summary && (
        <div className="mt-6 rounded-xl bg-banyan-light px-5 py-4 text-sm font-semibold text-banyan">
          Key benefit: {scheme.benefit_summary}
        </div>
      )}

      <p className="mt-6 text-base leading-relaxed text-slate">{scheme.description}</p>

      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        <Section icon={CheckCircle2} title="Benefits">
          <ul className="space-y-2">
            {(scheme.benefits ?? []).map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-banyan" />
                {b}
              </li>
            ))}
          </ul>
        </Section>

        <Section icon={ListChecks} title="Eligibility criteria">
          <ul className="space-y-2">
            {(scheme.eligibility ?? []).map((e, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-marigold-dark" />
                {e}
              </li>
            ))}
          </ul>
        </Section>

        <Section icon={FileText} title="Documents required">
          <ul className="space-y-2">
            {(scheme.documents ?? []).map((d, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink/40" />
                {d}
              </li>
            ))}
          </ul>
        </Section>

        <Section icon={ListChecks} title="How to apply">
          <ol className="space-y-2">
            {(scheme.application_steps ?? []).map((s, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink font-mono text-[10px] font-semibold text-paper">
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ol>
        </Section>
      </div>

      <div className="mt-10 rounded-2xl border border-dashed border-ink/15 bg-sand/30 p-6 text-center">
        <p className="text-sm text-slate">
          This is demo scheme data for a coursework project. In a production deployment, this
          section would link to the scheme's official application portal.
        </p>
        <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-ink/50">
          <ExternalLink className="h-4 w-4" /> Official portal link unavailable in demo
        </span>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <Icon className="h-4.5 w-4.5 text-marigold-dark" />
        <h2 className="font-display text-base font-semibold text-ink">{title}</h2>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}
