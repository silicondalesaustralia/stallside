/** Highlighted upsell callout for LP heroes (above the fold). */
export default function LpUpsellHighlight({
  label,
  detail,
}: {
  label: string;
  detail: string;
}) {
  return (
    <div className="mt-4 flex max-w-xl items-start gap-3 rounded-xl border border-[var(--leaf)]/35 bg-[linear-gradient(135deg,rgb(46_125_63_/_0.12),rgb(46_125_63_/_0.04))] px-3.5 py-3 shadow-sm">
      <span
        className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--leaf)] text-white shadow-sm"
        aria-hidden
      >
        <svg
          viewBox="0 0 24 24"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3v18" />
          <path d="M7 8h7a3 3 0 0 1 0 6H9" />
          <path d="M9 14h6a3 3 0 0 1 0 6H7" />
        </svg>
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[var(--leaf-dark)]">{label}</p>
        <p className="mt-0.5 text-sm leading-snug text-[var(--ink)]">{detail}</p>
      </div>
    </div>
  );
}
