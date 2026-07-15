import Link from "next/link";

export default function TrialDaysBadge({
  daysLeft,
  mode = "trial",
}: {
  daysLeft: number;
  mode?: "trial" | "paid";
}) {
  const label =
    mode === "paid"
      ? daysLeft <= 0
        ? "Paid access ended"
        : daysLeft === 1
          ? "1 day left on paid plan"
          : `${daysLeft} days left on paid plan`
      : daysLeft <= 0
        ? "Trial ended"
        : daysLeft === 1
          ? "1 day left on free plan"
          : `${daysLeft} days left on free plan`;

  const cta = mode === "paid" ? "Resubscribe" : "Subscribe Now";

  return (
    <p className="mb-3 flex flex-wrap items-center gap-2 print:hidden">
      <span className="inline-flex items-center rounded-full border border-[var(--leaf)]/30 bg-[var(--leaf)]/10 px-3 py-1 text-xs font-semibold text-[var(--leaf-dark)]">
        {label}
      </span>
      <Link
        href="/dashboard/settings/billing"
        className="inline-flex items-center rounded-full bg-[var(--leaf)] px-3 py-1 text-xs font-semibold text-white transition hover:bg-[var(--leaf-dark)]"
      >
        {cta}
      </Link>
    </p>
  );
}
