"use client";

import { useState } from "react";
import {
  formatPercent,
  marginPercent,
  markupPercent,
  profitCents,
  suggestedPriceCents,
} from "@/lib/production/pricing";
import { inputClass, labelClass } from "../../form-styles";

const DEFAULT_FEE_PCT = "4.25";
const DEFAULT_FIXED_FEE = "0.30";

function fmt(cents: number, currency: string) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(cents / 100);
}

function num(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export default function PricingCalculator({
  unitCostCents,
  priceCents,
  currency,
}: {
  unitCostCents: number;
  priceCents: number;
  currency: string;
}) {
  const [margin, setMargin] = useState("50");
  const [feePct, setFeePct] = useState(DEFAULT_FEE_PCT);
  const [fixedFee, setFixedFee] = useState(DEFAULT_FIXED_FEE);
  const fees = { feePct: num(feePct), fixedFeeCents: Math.round(num(fixedFee) * 100) };

  const suggested = suggestedPriceCents({ unitCostCents, marginPct: num(margin), ...fees });
  const profit = profitCents({ priceCents, unitCostCents, ...fees });

  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="grid grid-cols-3 gap-2">
        <label className={labelClass}>
          Target margin %
          <input value={margin} onChange={(e) => setMargin(e.target.value)} type="number" step="any" className={inputClass} />
        </label>
        <label className={labelClass}>
          Fees % of sale
          <input value={feePct} onChange={(e) => setFeePct(e.target.value)} type="number" step="any" className={inputClass} />
        </label>
        <label className={labelClass}>
          Fixed fee ($)
          <input value={fixedFee} onChange={(e) => setFixedFee(e.target.value)} type="number" step="0.01" className={inputClass} />
        </label>
      </div>
      <p className="text-xs text-[var(--muted)]">
        Default fees: 2.5% Vendl fee on the Free plan plus about 1.75% + 30c card processing. Set 0 for cash sales or Pro.
        Prices exclude GST.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg bg-[var(--wash)] px-3 py-2">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)]">Suggested price</p>
          <p className="text-lg font-semibold tabular-nums">
            {suggested == null ? "Margin + fees must be under 100%" : fmt(suggested, currency)}
          </p>
          <p className="text-xs text-[var(--muted)]">Unit cost {fmt(Math.round(unitCostCents), currency)}</p>
        </div>
        <div className="rounded-lg bg-[var(--wash)] px-3 py-2">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
            At current price {fmt(priceCents, currency)}
          </p>
          <p className={`text-lg font-semibold tabular-nums ${profit < 0 ? "text-red-700" : ""}`}>
            {fmt(Math.round(profit), currency)} profit
          </p>
          <p className="text-xs text-[var(--muted)]">
            Margin {formatPercent(marginPercent(priceCents, profit))} · Markup{" "}
            {formatPercent(markupPercent(unitCostCents, profit))}
          </p>
        </div>
      </div>
    </div>
  );
}
