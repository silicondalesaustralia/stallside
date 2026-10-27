import { formatPercent } from "@/lib/production/pricing";
import type { PriceBreakdown } from "@/lib/production/price-model";

export function formatCents(cents: number, currency: string) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(Math.round(cents) / 100);
}

export default function PriceStat({
  label,
  priceCents,
  breakdown,
  currency,
  note,
  highlight,
}: {
  label: string;
  priceCents: number | null;
  breakdown: PriceBreakdown | null;
  currency: string;
  note?: string;
  highlight?: boolean;
}) {
  const loss = breakdown != null && breakdown.profitCents < 0;
  return (
    <div className={`rounded-lg px-3 py-2 ${highlight ? "bg-[var(--leaf)]/10 outline outline-[var(--leaf)]" : "bg-[var(--wash)]"}`}>
      <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)]">{label}</p>
      <p className="text-lg font-semibold tabular-nums">{priceCents == null ? "—" : formatCents(priceCents, currency)}</p>
      {breakdown ? (
        <p className={`text-xs tabular-nums ${loss ? "font-semibold text-red-700" : "text-[var(--muted)]"}`}>
          {formatCents(breakdown.profitCents, currency)} profit · margin {formatPercent(breakdown.marginPct)} · markup{" "}
          {formatPercent(breakdown.markupPct)}
        </p>
      ) : null}
      {note ? <p className="text-xs text-[var(--muted)]">{note}</p> : null}
    </div>
  );
}
