import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShieldCheck, Lock, Users2, ArrowRight } from "lucide-react";
import { schemeApi } from "../api/endpoints";

const CATEGORY_ICON_LABEL = {
  Education: "🎓",
  Employment: "💼",
  Agriculture: "🌾",
  Healthcare: "🩺",
  "Women & Child Welfare": "👩‍👧",
  "Senior Citizens": "🧓",
  Housing: "🏠",
  "Financial Assistance": "💳",
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    schemeApi.categories().then(({ data }) => setCategories(data.categories)).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(query ? `/schemes?q=${encodeURIComponent(query)}` : "/schemes");
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #F0AB3D 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <h1 className="font-display text-4xl font-semibold leading-[1.1] tracking-tight text-paper sm:text-5xl">
            Find the government support<br className="hidden sm:block" /> you're entitled to.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-paper/65">
            Search scholarships, pensions, farmer subsidies and welfare grants across central
            and state schemes — explained in plain language, with the exact documents you'll need.
          </p>

          <form onSubmit={handleSearch} className="mx-auto mt-8 flex max-w-lg items-center gap-2 rounded-full bg-paper p-1.5 shadow-lg">
            <Search className="ml-3 h-4.5 w-4.5 shrink-0 text-slate-light" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try “farmer subsidy” or “scholarship”"
              className="w-full bg-transparent px-1 py-2 text-sm text-ink outline-none placeholder:text-slate-light"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-marigold px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-marigold-dark"
            >
              Search
            </button>
          </form>

          <div className="mx-auto mt-5 flex max-w-lg flex-wrap items-center justify-center gap-2 text-xs text-paper/50">
            <span>Popular:</span>
            {["Scholarship", "Farmer subsidy", "Pension", "Housing loan"].map((t) => (
              <Link key={t} to={`/schemes?q=${encodeURIComponent(t)}`} className="rounded-full border border-paper/15 px-2.5 py-1 hover:border-marigold/50 hover:text-marigold">
                {t}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-ink/10 bg-sand/50">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 shrink-0 text-banyan" />
            <div>
              <p className="text-sm font-semibold text-ink">Role-based access</p>
              <p className="text-xs text-slate">Citizen and admin roles are enforced end-to-end on the server.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 shrink-0 text-banyan" />
            <div>
              <p className="text-sm font-semibold text-ink">Secure by design</p>
              <p className="text-xs text-slate">Hashed passwords, signed sessions, and validated input throughout.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Users2 className="h-5 w-5 shrink-0 text-banyan" />
            <div>
              <p className="text-sm font-semibold text-ink">Built for citizens</p>
              <p className="text-xs text-slate">Plain-language eligibility, documents, and step-by-step application guidance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-marigold-dark">Browse by category</p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-ink">Where do you want to start?</h2>
          </div>
          <Link to="/schemes" className="hidden items-center gap-1 text-sm font-medium text-ink hover:text-marigold-dark sm:flex">
            View all schemes <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.category}
              to={`/schemes?category=${encodeURIComponent(c.category)}`}
              className="group rounded-2xl border border-ink/10 bg-white p-5 transition-all hover:border-marigold/40 hover:shadow-[0_4px_20px_-6px_rgba(27,42,74,0.15)]"
            >
              <span className="text-2xl">{CATEGORY_ICON_LABEL[c.category] || "📄"}</span>
              <p className="mt-3 font-display text-sm font-semibold text-ink">{c.category}</p>
              <p className="mt-1 text-xs text-slate">{c.count} scheme{c.count === 1 ? "" : "s"}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="rounded-3xl bg-ink px-8 py-12 text-center sm:px-16">
          <h2 className="font-display text-2xl font-semibold text-paper sm:text-3xl">
            Not sure what you qualify for?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-paper/60">
            Answer a few quick questions about your age, income and occupation to see a
            personalised shortlist of eligible schemes.
          </p>
          <Link
            to="/eligibility"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-marigold px-6 py-3 text-sm font-semibold text-ink hover:bg-marigold-dark"
          >
            Check my eligibility <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
