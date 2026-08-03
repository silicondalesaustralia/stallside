import Link from "next/link";

/** Badge for cancel-at-period-end / paid access ending soon. */
export default function TrialDaysBadge({
  daysLeft,
}: {
  daysLeft: number;
  /** @deprecated App trial removed; only paid countdown is shown. */
  mode?: "trial" | "paid";
}) {
  const label =
    daysLeft <= 0
      ? "Paid access ended"
      : daysLeft === 1
        ? "1 day left on paid plan"
        : `${daysLeft} days left on paid plan`;

  return (
    <p className="mb-3 flex flex-wrap items-center gap-2 print:hidden">
      <span className="inline-flex items-center rounded-full border border-[var(--leaf)]/30 bg-[var(--leaf)]/10 px-3 py-1 text-xs font-semibold text-[var(--leaf-dark)]">
        {label}
      </span>
      <Link
        href="/dashboard/settings/billing"
        className="inline-flex items-center rounded-full bg-[var(--leaf)] px-3 py-1 text-xs font-semibold text-white transition hover:bg-[var(--leaf-dark)]"
      >
        Resubscribe
      </Link>
    </p>
  );
}
