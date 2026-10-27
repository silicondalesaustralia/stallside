"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { parseDollarsToCents, priceBreakdown, priceForMargin } from "@/lib/production/price-model";
import { feesFromInputs, usePricingFees, type FeeInputs } from "@/lib/production/use-pricing-fees";
import { formatTaxRate, type TaxConfig } from "@/lib/tax/config";
import { inputClass, labelClass } from "../../form-styles";
import { saveProductPricing } from "../price-actions";
import PriceStat, { formatCents } from "./PriceStat";

export default function PricingCalculator({
  productId,
  unitCostCents,
  priceCents,
  currency,
  tax,
}: {
  productId: string;
  unitCostCents: number;
  priceCents: number;
  currency: string;
  tax: TaxConfig;
}) {
  const router = useRouter();
  const [feeInputs, setFeeInputs] = usePricingFees();
  const inclusiveTaxBps = tax.applies && tax.inclusive ? tax.rateBps : 0;
  const model = (fees: FeeInputs) => ({ unitCostCents, fees: feesFromInputs(fees), inclusiveTaxBps });
  const current = priceBreakdown({ priceCents, ...model(feeInputs) });

  const [price, setPrice] = useState((priceCents / 100).toFixed(2));
  const [margin, setMargin] = useState(current.marginPct == null ? "50" : current.marginPct.toFixed(1));
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [pending, startTransition] = useTransition();

  const newPriceCents = parseDollarsToCents(price);
  const proposed = newPriceCents == null ? null : priceBreakdown({ priceCents: newPriceCents, ...model(feeInputs) });
  const changed = newPriceCents != null && newPriceCents > 0 && newPriceCents !== priceCents;

  function priceFromMargin(marginText: string, fees: FeeInputs) {
    const next = priceForMargin({ marginPct: Number(marginText) || 0, ...model(fees) });
    if (next != null) setPrice((next / 100).toFixed(2));
  }

  function onMargin(value: string) {
    setMargin(value);
    priceFromMargin(value, feeInputs);
  }

  function onPrice(value: string) {
    setPrice(value);
    const cents = parseDollarsToCents(value);
    const m = cents == null ? null : priceBreakdown({ priceCents: cents, ...model(feeInputs) }).marginPct;
    if (m != null) setMargin(m.toFixed(1));
  }

  function onFees(next: FeeInputs) {
    setFeeInputs(next);
    priceFromMargin(margin, next);
  }

  function onSave() {
    if (newPriceCents == null) return;
    setMessage(null);
    const formData = new FormData();
    formData.set("productId", productId);
    formData.set("priceCents", String(newPriceCents));
    formData.set("costCents", String(Math.round(unitCostCents)));
    startTransition(async () => {
      try {
        const result = await saveProductPricing(formData);
        if ("error" in result) {
          setMessage({ text: result.error, error: true });
          return;
        }
        setMessage({ text: result.message ?? "Saved.", error: false });
        router.refresh();
      } catch (error) {
        console.error("Save price failed", error);
        setMessage({ text: "Could not save the price. Try again.", error: true });
      }
    });
  }

  const taxNote = !tax.applies
    ? "No sales tax applied."
    : tax.inclusive
      ? `Prices include ${tax.name} (${formatTaxRate(tax.rateBps)}); margin is worked out after ${tax.name}.`
      : `Prices exclude ${tax.name.toLowerCase()}; it's added at checkout.`;

  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <label className={labelClass}>
          Target margin %
          <input value={margin} onChange={(e) => onMargin(e.target.value)} type="number" step="any" className={inputClass} />
        </label>
        <label className={labelClass}>
          Price ({currency})
          <input value={price} onChange={(e) => onPrice(e.target.value)} type="number" step="0.01" min="0" className={inputClass} />
        </label>
        <label className={labelClass}>
          Fees % of sale
          <input value={feeInputs.feePct} onChange={(e) => onFees({ ...feeInputs, feePct: e.target.value })} type="number" step="any" min="0" className={inputClass} />
        </label>
        <label className={labelClass}>
          Fixed fee ($)
          <input value={feeInputs.fixedFee} onChange={(e) => onFees({ ...feeInputs, fixedFee: e.target.value })} type="number" step="0.01" min="0" className={inputClass} />
        </label>
      </div>
      <p className="text-xs text-[var(--muted)]">
        Change the margin to get a price, or type a price to see its margin. Fees default to 2.5% Vendl (Free plan) plus about
        1.75% + 30c card processing; set 0 for cash or Pro. Fee settings are shared with the product editor. {taxNote}
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        <PriceStat label="Current price" priceCents={priceCents} breakdown={current} currency={currency} note={`Unit cost ${formatCents(unitCostCents, currency)}`} />
        <PriceStat
          label="New price"
          priceCents={newPriceCents}
          breakdown={proposed}
          currency={currency}
          highlight={changed}
          note={changed && newPriceCents != null ? `${newPriceCents > priceCents ? "+" : "−"}${formatCents(Math.abs(newPriceCents - priceCents), currency)} vs current` : "Same as current"}
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onSave}
          disabled={!changed || pending}
          className="rounded-lg bg-[var(--leaf)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-50"
        >
          {pending ? "Saving…" : changed && newPriceCents != null ? `Save ${formatCents(newPriceCents, currency)} as product price` : "Save as product price"}
        </button>
        <p className={`text-xs ${message?.error ? "text-red-700" : "text-[var(--muted)]"}`}>
          {message?.text ?? `Also saves the unit cost (${formatCents(unitCostCents, currency)}) so the product editor shows the same margin.`}
        </p>
      </div>
    </div>
  );
}
