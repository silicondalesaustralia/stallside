"use client";

import { useMemo, useState } from "react";
import type { SellMarket } from "@/lib/sell";
import {
  calculateCosts,
  sumScopedInputs,
  validateYield,
} from "@/lib/sell/calculator";
import { EXEMPLAR_DEMO_PRICE } from "@/lib/sell/exemplar-defaults";

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default function SellCostingDemo({ market }: { market: SellMarket }) {
  const defaults = market.calculator.inputs;
  const defaultPrice = EXEMPLAR_DEMO_PRICE[market.slug] ?? 18;
  const [values, setValues] = useState(() =>
    Object.fromEntries(defaults.map((i) => [i.id, i.value])),
  );
  const [yieldQty, setYieldQty] = useState(market.calculator.saleableYield);
  const [price, setPrice] = useState(defaultPrice);

  const inputs = defaults.map((input) => ({
    ...input,
    value: Number(values[input.id] ?? input.value),
  }));
  const batchCost = sumScopedInputs(inputs, "batch");
  const packaging = sumScopedInputs(inputs, "unit");
  const yieldError = validateYield(yieldQty);
  const priceOk = Number.isFinite(price) && price > 0;
  const valid = !yieldError && priceOk && Number.isInteger(yieldQty);

  const result = useMemo(() => {
    if (!valid) return null;
    return calculateCosts({
      batchCost,
      saleableYield: yieldQty,
      packagingPerUnit: packaging,
      price,
    });
  }, [valid, batchCost, yieldQty, packaging, price]);

  function reset() {
    setValues(Object.fromEntries(defaults.map((i) => [i.id, i.value])));
    setYieldQty(market.calculator.saleableYield);
    setPrice(defaultPrice);
  }

  return (
    <form
      className="calculator"
      id="calculator-form"
      onSubmit={(e) => e.preventDefault()}
      onReset={(e) => {
        e.preventDefault();
        reset();
      }}
    >
      <p className="fine">Try the example · USD</p>
      <div className="calc-fields">
        {inputs.map((input) => (
          <label key={input.id} htmlFor={input.id}>
            {input.label}
            <input
              id={input.id}
              name={input.id}
              type="number"
              min={0}
              step="0.01"
              required
              value={values[input.id] ?? 0}
              onChange={(e) =>
                setValues((prev) => ({
                  ...prev,
                  [input.id]: Number(e.target.value),
                }))
              }
            />
          </label>
        ))}
        <label htmlFor="saleable-yield">
          Saleable {market.calculator.saleUnit}s
          <input
            id="saleable-yield"
            type="number"
            min={1}
            step={1}
            required
            value={yieldQty}
            onChange={(e) => setYieldQty(Number(e.target.value))}
          />
        </label>
        <label htmlFor="selling-price-input">
          Selling price · per {market.calculator.saleUnit}
          <input
            id="selling-price-input"
            type="number"
            min={0}
            step="0.01"
            required
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
        </label>
      </div>
      <p id="calc-error" role="alert" className="fine" hidden={valid}>
        Enter non-negative costs, a whole-number yield of at least 1 and a selling price
        above 0.
      </p>
      <div className="calc-results" aria-live="polite">
        <div>
          <span>Cost per {market.calculator.saleUnit}</span>
          <strong>{result ? money(result.unitCost) : "—"}</strong>
        </div>
        <div>
          <span>Selling price</span>
          <strong>{result ? money(price) : "—"}</strong>
        </div>
        <div>
          <span>Before fees &amp; tax</span>
          <strong>
            {result?.contribution != null ? money(result.contribution) : "—"}
          </strong>
        </div>
      </div>
      <p className="fine" id="calc-detail">
        {result
          ? `Batch ${money(batchCost)} ÷ ${yieldQty} + ${money(packaging)} packaging. Contribution: ${result.contributionRate}% of selling price.`
          : "Update the inputs to calculate your example."}
      </p>
      <p className="fine">
        Not net profit. Payment fees and tax are separate. This demo is free to try; saved
        production tools are Pro.
      </p>
      <button className="reset" type="reset">
        Reset example
      </button>
    </form>
  );
}
