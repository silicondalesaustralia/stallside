import type { AffiliateStats } from "@/lib/affiliate/load-affiliate-stats";
import { formatTotals, totalsAreEmpty } from "@/lib/affiliate/currency-totals";

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="dash-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold text-[var(--field)]">{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-[var(--muted)]">{hint}</p> : null}
    </div>
  );
}

export default function ReferralStats({ stats }: { stats: AffiliateStats }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Link clicks" value={String(stats.clicks)} />
        <Stat label="Signups" value={String(stats.signups)} />
        <Stat label="Live Pro" value={String(stats.livePro)} />
        <Stat
          label="Monthly commission"
          value={formatTotals(stats.monthlyCommission)}
          hint="Estimate from current Pro referrals"
        />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Stat label="Owed to you" value={formatTotals(stats.owed)} hint="Paid out manually" />
        <Stat label="Paid to date" value={formatTotals(stats.paid)} />
        {totalsAreEmpty(stats.missed) ? null : (
          <Stat
            label="Missed"
            value={formatTotals(stats.missed)}
            hint="Earned while you weren't on Pro"
          />
        )}
      </div>
    </section>
  );
}
