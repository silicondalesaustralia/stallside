import { formatMoney } from "@/lib/money";
import type { VendorSalesTotals } from "@/lib/admin-vendor-sales";

function Figure({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-2 font-receipt text-2xl font-semibold tabular-nums tracking-tight [overflow-wrap:anywhere]">
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-xs text-[var(--muted)]">{hint}</p> : null}
    </div>
  );
}

function takeRate(feeCents: number, salesCents: number): string | undefined {
  if (salesCents <= 0) return undefined;
  return `${((feeCents / salesCents) * 100).toFixed(1)}% of sales`;
}

export default function AdminVendorSalesCard({
  windowLabel,
  currency,
  sales,
  salesAllTime,
  feeCents,
  feeAllTimeCents,
  feesFromStripe,
}: {
  windowLabel: string;
  currency: string;
  sales: VendorSalesTotals;
  salesAllTime: VendorSalesTotals;
  feeCents: number;
  feeAllTimeCents: number;
  feesFromStripe: boolean;
}) {
  return (
    <section className="dash-card p-5">
      <h2 className="text-lg font-semibold">Vendor sales · {windowLabel}</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Gross sales across all stalls (AUD) and the platform fees collected on them.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Figure label="Amount" value={formatMoney(sales.salesAudCents, currency)} />
        <Figure label="Orders" value={sales.orderCount.toLocaleString()} />
        <Figure
          label={`Fees collected${feesFromStripe ? " (Stripe)" : ""}`}
          value={formatMoney(feeCents, currency)}
          hint={takeRate(feeCents, sales.salesAudCents)}
        />
      </div>
      <p className="mt-3 text-sm text-[var(--muted)]">
        All-time {formatMoney(salesAllTime.salesAudCents, currency)} ·{" "}
        {salesAllTime.orderCount.toLocaleString()} orders ·{" "}
        {formatMoney(feeAllTimeCents, currency)} fees
      </p>
    </section>
  );
}
