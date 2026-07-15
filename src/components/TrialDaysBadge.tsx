import Link from "next/link";

export default function TrialDaysBadge({ daysLeft }: { daysLeft: number }) {
  const label =
    daysLeft <= 0
      ? "Trial ended"
      : daysLeft === 1
        ? "1 day left on free plan"
        : `${daysLeft} days left on free plan`;

  return (
    <p className="mb-3 print:hidden">
      <Link
        href="/dashboard/settings/billing"
        className="inline-flex items-center rounded-full border border-[var(--leaf)]/30 bg-[var(--leaf)]/10 px-3 py-1 text-xs font-semibold text-[var(--leaf-dark)] transition hover:bg-[var(--leaf)]/15"
      >
        {label}
      </Link>
    </p>
  );
}
