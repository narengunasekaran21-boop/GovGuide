export default function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex items-center gap-3 text-slate">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-marigold border-t-transparent" />
        <span className="font-body text-sm">Loading…</span>
      </div>
    </div>
  );
}
