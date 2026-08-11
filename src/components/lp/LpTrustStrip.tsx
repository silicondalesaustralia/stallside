type Props = {
  heading?: string;
  items?: string[];
  footnote?: string;
};

export default function LpTrustStrip({
  heading = "Let customers pay the way they already prefer",
  items,
  footnote = "No card reader. Payments happen on the customer's phone. PayID is Australia-only and always free of Vendl fees.",
}: Props) {
  if (items && items.length > 0) {
    return (
      <section className="px-5 pb-10 sm:px-6 sm:pb-12">
        <div className="mx-auto max-w-6xl rounded-[var(--radius)] border border-[var(--line)] bg-white px-5 py-6 shadow-sm sm:px-8 sm:py-7">
          <p className="text-center text-sm font-semibold text-[var(--field)] sm:text-base">
            {heading}
          </p>
          <ul className="mt-5 flex flex-wrap justify-center gap-2 sm:gap-3">
            {items.map((label) => (
              <li
                key={label}
                className="rounded-[var(--radius-pill)] border border-[var(--line)] bg-[var(--wash)] px-3 py-1.5 text-xs font-semibold text-[var(--ink)] sm:text-sm"
              >
                {label}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-center text-sm text-[var(--muted)]">{footnote}</p>
        </div>
      </section>
    );
  }

  // Fallback: full payment icon strip for missed-sales (imported lazily via LpPaymentStrip)
  return null;
}
