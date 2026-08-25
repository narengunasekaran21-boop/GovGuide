import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { schemeApi, bookmarkApi } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import SchemeCard from "../components/SchemeCard";
import PageLoader from "../components/PageLoader";

export default function Schemes() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [schemes, setSchemes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const governmentLevel = searchParams.get("governmentLevel") || "";

  const fetchSchemes = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await schemeApi.list({
        q: q || undefined,
        category: category || undefined,
        governmentLevel: governmentLevel || undefined,
      });
      setSchemes(Array.isArray(data?.schemes) ? data.schemes : []);
    } catch {
      setSchemes([]);
    } finally {
      setLoading(false);
    }
  }, [q, category, governmentLevel]);

  useEffect(() => {
    fetchSchemes();
  }, [fetchSchemes]);

  useEffect(() => {
    schemeApi
      .categories()
      .then(({ data }) => setCategories(Array.isArray(data?.categories) ? data.categories : []))
      .catch(() => setCategories([]));
  }, []);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const clearFilters = () => setSearchParams({});

  const toggleBookmark = async (scheme) => {
    if (!user) return;
    if (scheme.isBookmarked) {
      await bookmarkApi.remove(scheme.id);
    } else {
      await bookmarkApi.add(scheme.id);
    }
    setSchemes((prev) =>
      prev.map((s) => (s.id === scheme.id ? { ...s, isBookmarked: !s.isBookmarked } : s))
    );
  };

  const activeFilterCount = useMemo(
    () => [category, governmentLevel].filter(Boolean).length,
    [category, governmentLevel]
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-1">
        <p className="font-mono text-xs uppercase tracking-widest text-marigold-dark">Scheme directory</p>
        <h1 className="font-display text-3xl font-semibold text-ink">Browse government schemes</h1>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-light" />
          <input
            value={q}
            onChange={(e) => updateParam("q", e.target.value)}
            placeholder="Search by scheme name, keyword, or benefit…"
            className="w-full rounded-full border border-ink/15 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-marigold-dark focus:ring-2 focus:ring-marigold/30"
          />
        </div>
        <button
          onClick={() => setShowFilters((s) => !s)}
          className="flex items-center justify-center gap-2 rounded-full border border-ink/15 bg-white px-5 py-3 text-sm font-medium text-ink hover:border-ink/30"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </button>
      </div>

      {showFilters && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-ink/10 bg-sand/40 p-4">
          <select
            value={category}
            onChange={(e) => updateParam("category", e.target.value)}
            className="rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.category} value={c.category}>{c.category}</option>
            ))}
          </select>

          <select
            value={governmentLevel}
            onChange={(e) => updateParam("governmentLevel", e.target.value)}
            className="rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm"
          >
            <option value="">Central & State</option>
            <option value="CENTRAL">Central only</option>
            <option value="STATE">State only</option>
          </select>

          {(activeFilterCount > 0 || q) && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-sm font-medium text-clay hover:underline">
              <X className="h-3.5 w-3.5" /> Clear all
            </button>
          )}
        </div>
      )}

      <div className="mt-6 text-sm text-slate">
        {loading ? "Searching…" : `${schemes.length} scheme${schemes.length === 1 ? "" : "s"} found`}
      </div>

      {loading ? (
        <PageLoader />
      ) : schemes.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-ink/15 p-12 text-center">
          <p className="font-display text-lg font-semibold text-ink">No schemes match your search</p>
          <p className="mt-1 text-sm text-slate">Try a different keyword or clear your filters.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {schemes.map((s) => (
            <SchemeCard
              key={s.id}
              scheme={s}
              isBookmarked={s.isBookmarked}
              canBookmark={!!user}
              onToggleBookmark={toggleBookmark}
            />
          ))}
        </div>
      )}
    </div>
  );
}
