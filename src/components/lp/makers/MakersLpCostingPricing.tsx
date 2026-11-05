"use client";

import { useState } from "react";
import { parseDollarsToCents, priceBreakdown, priceForMargin } from "@/lib/production/price-model";
import { formatPercent } from "@/lib/production/pricing";
import { HOME_FEE_PRESETS, formatAud, type MakersLpFeePresetId } from "@/lib/makers-lp-costing-fees";

const INPUT =
  "mt-1 w-full rounded-md border border-[var(--line)] bg-white px-2 py-1.5 tabular-nums focus:border-[var(--leaf)] focus:outline-none";

function Stat({ label, value, tone }: { label: string; value: string; tone?: "loss" | "good" }) {
  const color = tone === "loss" ? "text-red-700" : tone === "good" ? "text-[var(--leaf)]" : "text-[var(--field)]";
  return (
    <div className="rounded-lg bg-[var(--wash)] px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">{label}</p>
      <p className={`text-lg font-semibold tabular-nums ${color}`}>{value}</p>
    </div>
  );
}

export default function MakersLpCostingPricing({ unitCostCents, startPriceCents }: { unitCostCents: number; startPriceCents: number }) {
  const [priceText, setPriceText] = useState((startPriceCents / 100).toFixed(2));
  const [marginDraft, setMarginDraft] = useState<string | null>(null);
  const [feeId, setFeeId] = useState<MakersLpFeePresetId>("free-card");

  const preset = HOME_FEE_PRESETS.find((p) => p.id === feeId) ?? HOME_FEE_PRESETS[0];
  const fees = { feePct: preset.feePct, fixedFeeCents: preset.fixedFeeCents };
  const model = { unitCostCents, fees, inclusiveTaxBps: 0 };
  const priceCents = parseDollarsToCents(priceText);
  const result = priceCents == null ? null : priceBreakdown({ priceCents, ...model });
  const marginShown = marginDraft ?? (result?.marginPct == null ? "" : result.marginPct.toFixed(1));

  function onMargin(value: string) {
    setMarginDraft(value);
    const next = priceForMargin({ marginPct: Number(value) || 0, ...model });
    if (next != null) setPriceText((next / 100).toFixed(2));
  }

  const loss = result != null && result.profitCents < 0;
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[var(--line)] bg-white p-4 text-sm">
      <p className="text-base font-semibold text-[var(--field)]">Set your price</p>
      <div className="grid grid-cols-2 gap-2 text-xs text-[var(--muted)]">
        <label>
          Target margin %
          <input
            type="number"
            step="any"
            value={marginShown}
            onChange={(e) => onMargin(e.target.value)}
            onBlur={() => setMarginDraft(null)}
            className={INPUT}
          />
        </label>
        <label>
          Price (AUD)
          <input
            type="number"
            min="0"
            step="0.01"
            value={priceText}
            onChange={(e) => {
              setMarginDraft(null);
              setPriceText(e.target.value);
            }}
            className={INPUT}
          />
        </label>
        <label className="col-span-2">
          How they pay
          <select value={feeId} onChange={(e) => {
              const next = HOME_FEE_PRESETS.find((p) => p.id === e.target.value);
              if (next) setFeeId(next.id);
            }} className={INPUT}>
            {HOME_FEE_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Cost to make" value={formatAud(unitCostCents)} />
        <Stat label="Fees" value={result ? formatAud(result.feesCents) : "-"} />
        <Stat label="Profit each" value={result ? formatAud(result.profitCents) : "-"} tone={loss ? "loss" : "good"} />
        <Stat label="Margin" value={formatPercent(result?.marginPct ?? null)} tone={loss ? "loss" : undefined} />
      </div>
      <p className="text-xs text-[var(--muted)]">
        Type a margin to get a price, or a price to see your margin. Card fees are estimates; GST not included.
      </p>
    </div>
  );
}
