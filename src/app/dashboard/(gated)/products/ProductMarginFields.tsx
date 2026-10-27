"use client";

import Link from "next/link";
import { useState } from "react";
import { formatMoney } from "@/lib/money";
import { priceBreakdown, priceForMargin } from "@/lib/production/price-model";
import { formatPercent } from "@/lib/production/pricing";
import type { ProductRecipeCost } from "@/lib/production/load-product-recipe-cost";
import { feesFromInputs, usePricingFees } from "@/lib/production/use-pricing-fees";
import type { TaxConfig } from "@/lib/tax/config";

export default function ProductMarginFields({
  currency,
  costCents,
  priceCents,
  tax,
  recipeCost,
  onSetPrice,
  onUseRecipeCost,
}: {
  currency: string;
  costCents: number | null;
  priceCents: number | null;
  tax?: TaxConfig;
  recipeCost?: ProductRecipeCost | null;
  onSetPrice: (cents: number) => void;
  onUseRecipeCost: (cents: number) => void;
}) {
  const [feeInputs] = usePricingFees();
  const [marginDraft, setMarginDraft] = useState<string | null>(null);
  const fees = feesFromInputs(feeInputs);
  const inclusiveTaxBps = tax?.applies && tax.inclusive ? tax.rateBps : 0;
  const breakdown =
    costCents != null && priceCents != null && priceCents > 0
      ? priceBreakdown({ priceCents, unitCostCents: costCents, fees, inclusiveTaxBps })
      : null;
  const shownMargin = marginDraft ?? (breakdown?.marginPct == null ? "" : breakdown.marginPct.toFixed(1));

  function onMargin(value: string) {
    setMarginDraft(value);
    const pct = Number(value);
    if (costCents == null || value.trim() === "" || !Number.isFinite(pct)) return;
    const next = priceForMargin({ unitCostCents: costCents, marginPct: pct, fees, inclusiveTaxBps });
    if (next != null) onSetPrice(next);
  }

  const recipeDiffers = recipeCost != null && recipeCost.unitCostCents !== costCents;

  return (
    <div className="flex flex-col gap-2 text-sm">
      <label className="flex flex-col gap-2">
        <span className="font-medium">Margin % (after fees)</span>
        <input
          type="number"
          step="any"
          value={shownMargin}
          disabled={costCents == null}
          onChange={(e) => onMargin(e.target.value)}
          onBlur={() => setMarginDraft(null)}
          placeholder={costCents == null ? "Enter a cost first" : "e.g. 50"}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 disabled:bg-[var(--wash)]"
        />
      </label>
      <p className="text-[var(--muted)]">
        {breakdown ? (
          <>
            <span className={`font-medium ${breakdown.profitCents < 0 ? "text-red-700" : "text-[var(--ink)]"}`}>
              {formatMoney(breakdown.profitCents, currency)} profit
            </span>{" "}
            · margin {formatPercent(breakdown.marginPct)} · markup {formatPercent(breakdown.markupPct)}
          </>
        ) : (
          "Add a price and cost to see your margin."
        )}
      </p>
      <p className="text-xs text-[var(--muted)]">
        Changing the margin sets the price. Allows {feeInputs.feePct}% + {formatMoney(fees.fixedFeeCents, currency)} fees per sale
        {inclusiveTaxBps > 0 && tax ? ` and removes the included ${tax.name}` : ""}. Fees are set in the Production pricing
        calculator.
      </p>
      {recipeCost ? (
        <p className="rounded-lg bg-[var(--wash)] px-3 py-2 text-xs">
          Production cost from{" "}
          <Link href={`/dashboard/production/recipes/${recipeCost.recipeId}`} className="font-semibold underline">
            {recipeCost.recipeName}
          </Link>
          : <span className="font-semibold">{formatMoney(recipeCost.unitCostCents, currency)}</span> per item, packaging included.{" "}
          {recipeDiffers ? (
            <button type="button" onClick={() => onUseRecipeCost(recipeCost.unitCostCents)} className="font-semibold text-[var(--leaf)] underline">
              Use this cost
            </button>
          ) : (
            "Cost matches."
          )}
        </p>
      ) : null}
    </div>
  );
}
