import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-sm text-marigold-dark">404</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink">Page not found</h1>
      <p className="mt-2 text-sm text-slate">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/" className="mt-6 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:bg-ink-light">
        Back to home
      </Link>
    </div>
  );
}
