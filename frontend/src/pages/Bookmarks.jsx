import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark } from "lucide-react";
import { bookmarkApi } from "../api/endpoints";
import SchemeCard from "../components/SchemeCard";
import PageLoader from "../components/PageLoader";

export default function Bookmarks() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = () => {
    setLoading(true);
    bookmarkApi
      .list()
      .then(({ data }) => setSchemes(data.schemes.map((s) => ({ ...s, isBookmarked: true }))))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const toggleBookmark = async (scheme) => {
    await bookmarkApi.remove(scheme.id);
    setSchemes((prev) => prev.filter((s) => s.id !== scheme.id));
  };

  if (loading) return <PageLoader />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-widest text-marigold-dark">Your list</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Saved schemes</h1>

      {schemes.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-ink/15 p-12 text-center">
          <Bookmark className="mx-auto h-8 w-8 text-slate-light" />
          <p className="mt-3 font-display text-lg font-semibold text-ink">Nothing saved yet</p>
          <p className="mt-1 text-sm text-slate">Bookmark schemes as you browse to find them here later.</p>
          <Link
            to="/schemes"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:bg-ink-light"
          >
            Browse schemes
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {schemes.map((s) => (
            <SchemeCard key={s.id} scheme={s} isBookmarked canBookmark onToggleBookmark={toggleBookmark} />
          ))}
        </div>
      )}
    </div>
  );
}
