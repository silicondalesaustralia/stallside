/** Floating “upsell offer” card for hero visuals. */
export default function LpUpsellOfferBadge({
  title = "Get this right now",
  price,
  compareAt,
}: {
  title?: string;
  price: string;
  compareAt?: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--leaf)]/40 bg-white px-3 py-2.5 shadow-lg">
      <div className="flex items-center gap-2">
        <span
          className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--leaf)] text-white"
          aria-hidden
        >
          <svg
            viewBox="0 0 24 24"
            className="size-3.5"
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
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--leaf)]">
            Upsell
          </p>
          <p className="truncate text-[11px] font-semibold text-[var(--field)]">
            {title}
          </p>
        </div>
      </div>
      <p className="mt-1.5 text-[11px] text-[var(--muted)]">
        {compareAt ? (
          <>
            <span className="line-through">{compareAt}</span>{" "}
            <span className="font-semibold text-[var(--leaf-dark)]">{price}</span>
          </>
        ) : (
          <span className="font-semibold text-[var(--leaf-dark)]">{price}</span>
        )}
        <span className="text-[var(--muted)]"> · at checkout</span>
      </p>
    </div>
  );
}
