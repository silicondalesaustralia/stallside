import type { ReferralRow } from "@/lib/affiliate/load-affiliate-stats";
import { formatTotals } from "@/lib/affiliate/currency-totals";

const dateFormat = new Intl.DateTimeFormat("en-AU", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default function ReferralList({ referrals }: { referrals: ReferralRow[] }) {
  return (
    <section className="dash-card p-5">
      <h2 className="font-semibold text-[var(--field)]">Your referrals</h2>
      {referrals.length === 0 ? (
        <p className="mt-2 text-sm text-[var(--muted)]">
          No signups yet. Share your link to get started.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-[var(--line)]">
          {referrals.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 py-3 text-sm">
              <span className="min-w-0">
                <span className="block truncate font-semibold text-[var(--field)]">
                  {r.businessName}
                </span>
                <span className="text-[var(--muted)]">
                  Joined {dateFormat.format(r.joinedAt)} · {r.status}
                </span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block font-semibold">{formatTotals(r.earned)}</span>
                <span className="text-xs text-[var(--muted)]">earned</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
