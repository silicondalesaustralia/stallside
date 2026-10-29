import Link from "next/link";
import {
  EMAIL_STATS_RANGES,
  type EmailStatsRangeKey,
} from "@/lib/email-stats/load-email-stats";

export default function EmailRangeTabs({ active }: { active: EmailStatsRangeKey }) {
  return (
    <nav className="flex flex-wrap gap-2 text-sm">
      {EMAIL_STATS_RANGES.map((range) => (
        <Link
          key={range.key}
          href={`/admin/emails?range=${range.key}`}
          className={
            range.key === active
              ? "rounded-full bg-[var(--field)] px-3 py-1.5 font-medium text-white"
              : "rounded-full border border-[var(--line)] px-3 py-1.5 text-[var(--muted)]"
          }
        >
          {range.label}
        </Link>
      ))}
    </nav>
  );
}
