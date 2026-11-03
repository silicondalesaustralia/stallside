"use client";

import { useState } from "react";
import HomeCostingBatch from "@/components/home/HomeCostingBatch";
import HomeCostingMaterials from "@/components/home/HomeCostingMaterials";
import HomeCostingPricing from "@/components/home/HomeCostingPricing";
import HomeTryItArrows from "@/components/home/HomeTryItArrows";
import { costRecipe, ingredientCostPerBase, productUnitCostCents, type CostContext } from "@/lib/production/batch-costing";
import {
  HOME_COSTING_MATERIALS,
  HOME_COSTING_PRODUCTS,
  type HomeCostingProduct,
  type HomeCostingRecipe,
} from "@/lib/home-costing-demo";

const RECIPE_ID = "demo-recipe";

type ProductId = HomeCostingProduct["id"];

export default function HomeCostingCalculator() {
  const [productId, setProductId] = useState<ProductId>("focaccia");
  const [edits, setEdits] = useState<Partial<Record<ProductId, HomeCostingRecipe>>>({});
  const [packPrices, setPackPrices] = useState<Record<string, number>>({});
  const [version, setVersion] = useState(0);

  const product = HOME_COSTING_PRODUCTS.find((p) => p.id === productId) ?? HOME_COSTING_PRODUCTS[0];
  const recipe = edits[product.id] ?? product.recipe;
  const ingredients = new Map(
    HOME_COSTING_MATERIALS.map((m) => [m.id, { ...m, purchasePriceCents: packPrices[m.id] ?? m.purchasePriceCents }]),
  );
  const lines = recipe.lines.map((l) => ({ ...l, componentRecipeId: null }));
  const ctx: CostContext = {
    ingredients,
    recipes: new Map([[RECIPE_ID, { id: RECIPE_ID, name: product.name, ...recipe, lines }]]),
  };
  const cost = costRecipe(RECIPE_ID, ctx);
  const packaging = ingredients.get(product.packagingId);
  const packagingCents = (packaging ? ingredientCostPerBase(packaging) : null) ?? 0;
  const unitCostCents = productUnitCostCents({
    batchTotalCents: cost.totalCents,
    yieldQuantity: recipe.yieldQuantity,
    yieldUnitsPerProduct: product.unitsPerProduct,
    packagingCostCents: packagingCents,
  });

  function updateRecipe(next: Partial<HomeCostingRecipe>) {
    setEdits((all) => ({ ...all, [product.id]: { ...(all[product.id] ?? product.recipe), ...next } }));
  }

  function reset() {
    setEdits({});
    setPackPrices({});
    setVersion((v) => v + 1);
  }

  return (
    <div className="rounded-2xl border border-[#ccd7bf] bg-[var(--wash)] p-4 text-[var(--ink)] sm:p-6">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Example product" className="flex flex-wrap gap-2">
          {HOME_COSTING_PRODUCTS.map((p) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={p.id === product.id}
              onClick={() => setProductId(p.id)}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${
                p.id === product.id
                  ? "border-[var(--field)] bg-[var(--field)] text-white"
                  : "border-[var(--line)] bg-white text-[var(--field)] hover:border-[var(--field)]"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
        <button type="button" onClick={reset} className="text-xs font-semibold text-[var(--muted)] underline underline-offset-4">
          Reset figures
        </button>
      </div>
      <HomeTryItArrows />
      <div key={`${product.id}-${version}`} className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
        <div className="flex min-w-0 flex-col gap-4">
          <HomeCostingMaterials
            lines={lines}
            ctx={ctx}
            wasteFactor={1 + recipe.wastePercent / 100}
            onQuantity={(lineId, quantity) =>
              updateRecipe({ lines: recipe.lines.map((l) => (l.id === lineId ? { ...l, quantity } : l)) })
            }
            onPackPrice={(id, cents) => setPackPrices((all) => ({ ...all, [id]: cents }))}
          />
          <HomeCostingBatch
            recipe={recipe}
            cost={cost}
            yieldLabel={product.yieldLabel}
            packagingCents={packagingCents}
            unitsPerProduct={product.unitsPerProduct}
            unitCostCents={unitCostCents}
            onChange={(key, value) => updateRecipe({ [key]: value })}
          />
        </div>
        <div className="min-w-0 self-start">
          <HomeCostingPricing unitCostCents={unitCostCents} startPriceCents={product.priceCents} />
        </div>
      </div>
    </div>
  );
}
