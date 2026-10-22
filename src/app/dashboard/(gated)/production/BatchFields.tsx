"use client";

import { useState } from "react";
import { hintClass, inputClass, labelClass } from "./form-styles";

export type BatchRecipeOption = {
  id: string;
  name: string;
  yieldQuantity: number;
  yieldLabel: string;
  batchCostCents: number;
  productId: string | null;
  yieldUnitsPerProduct: number | null;
};

function expectedUnits(recipe: BatchRecipeOption | undefined, count: number, productId: string): number {
  if (!recipe || !productId) return 0;
  const perProduct = recipe.productId === productId ? recipe.yieldUnitsPerProduct ?? 1 : 1;
  return Math.max(0, Math.floor((recipe.yieldQuantity * count) / perProduct));
}

export default function BatchFields({
  recipes,
  products,
  initialRecipeId,
  today,
  currency,
}: {
  recipes: BatchRecipeOption[];
  products: { id: string; name: string }[];
  initialRecipeId?: string;
  today: string;
  currency: string;
}) {
  const initial = recipes.find((r) => r.id === initialRecipeId) ?? recipes[0];
  const [recipeId, setRecipeId] = useState(initial?.id ?? "");
  const [count, setCount] = useState("1");
  const [productId, setProductId] = useState(initial?.productId ?? "");
  const [units, setUnits] = useState<string | null>(null);

  const recipe = recipes.find((r) => r.id === recipeId);
  const batchCount = Number(count) > 0 ? Number(count) : 0;
  const auto = expectedUnits(recipe, batchCount, productId);
  const cost = (recipe?.batchCostCents ?? 0) * batchCount;
  const shownUnits = units ?? String(auto);
  const perUnit = Number(shownUnits) > 0 ? cost / Number(shownUnits) : null;
  const fmt = (c: number) => new Intl.NumberFormat(undefined, { style: "currency", currency }).format(c / 100);

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <label className={labelClass}>
        Recipe
        <select
          name="recipeId"
          value={recipeId}
          onChange={(e) => {
            const next = recipes.find((r) => r.id === e.target.value);
            setRecipeId(e.target.value);
            setProductId(next?.productId ?? "");
            setUnits(null);
          }}
          className={inputClass}
        >
          {recipes.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        Batches made
        <input name="batchCount" type="number" step="any" min="0" value={count} onChange={(e) => { setCount(e.target.value); setUnits(null); }} className={inputClass} />
        <span className={hintClass}>{recipe ? `${recipe.yieldQuantity * batchCount} ${recipe.yieldLabel}` : ""}</span>
      </label>
      <label className={labelClass}>
        Adds stock to
        <select name="productId" value={productId} onChange={(e) => { setProductId(e.target.value); setUnits(null); }} className={inputClass}>
          <option value="">No product (sub-recipe or test)</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </label>
      {productId ? (
        <label className={labelClass}>
          Sellable units made
          <input name="unitsMade" type="number" step="1" min="0" value={shownUnits} onChange={(e) => setUnits(e.target.value)} className={inputClass} />
          <span className={hintClass}>Expected {auto}. Enter what actually turned out.</span>
        </label>
      ) : null}
      <label className={labelClass}>
        Made on
        <input name="madeAt" type="date" defaultValue={today} className={inputClass} />
      </label>
      <label className={labelClass}>
        Best before
        <input name="bestBefore" type="date" className={inputClass} />
      </label>
      <label className={labelClass}>
        Batch code
        <input name="batchCode" placeholder="Auto" className={inputClass} />
        <span className={hintClass}>Print it on labels so you can trace a batch.</span>
      </label>
      <label className={`${labelClass} sm:col-span-2`}>
        Notes
        <input name="notes" className={inputClass} />
      </label>
      <div className="flex flex-col justify-center gap-1 rounded-lg bg-[var(--wash)] px-3 py-2 text-sm sm:col-span-3">
        <p>
          Estimated cost <strong className="tabular-nums">{fmt(cost)}</strong>
          {perUnit != null && productId ? <> · <strong className="tabular-nums">{fmt(perUnit)}</strong> per unit</> : null}
        </p>
        {productId ? (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="updateCost" defaultChecked /> Update the product&apos;s unit cost from this batch
          </label>
        ) : null}
      </div>
    </div>
  );
}
