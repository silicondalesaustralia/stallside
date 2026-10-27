export default function KnowledgeVideoPlaceholder() {
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--line)] bg-[var(--panel)] text-[var(--muted)]">
      <svg aria-hidden viewBox="0 0 24 24" className="size-10" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <circle cx="12" cy="12" r="10" />
        <path d="M10 8.5v7l5.5-3.5z" fill="currentColor" stroke="none" />
      </svg>
      <p className="text-sm font-semibold">Video coming soon</p>
    </div>
  );
}
