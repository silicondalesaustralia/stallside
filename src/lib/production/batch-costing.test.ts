import { test } from "node:test";
import assert from "node:assert/strict";
import { costRecipe, productUnitCostCents, type CostContext } from "./batch-costing";
import { wouldCreateLoop } from "./recipe-graph";
import { suggestedPriceCents } from "./pricing";

const ctx: CostContext = {
  ingredients: new Map([
    ["flour", { id: "flour", name: "Flour", baseUnit: "G", purchaseQuantity: 10, purchaseUnit: "KG", purchasePriceCents: 2000 }],
    ["egg", { id: "egg", name: "Egg", baseUnit: "EACH", purchaseQuantity: 12, purchaseUnit: "EACH", purchasePriceCents: 600 }],
  ]),
  recipes: new Map([
    [
      "dough",
      {
        id: "dough", name: "Dough", yieldQuantity: 1000, wastePercent: 0, labourMinutes: 0, labourRateCents: 0, overheadCents: 0,
        lines: [{ id: "l1", ingredientId: "flour", componentRecipeId: null, quantity: 1, unit: "KG" }],
      },
    ],
    [
      "cookie",
      {
        id: "cookie", name: "Cookies", yieldQuantity: 12, wastePercent: 10, labourMinutes: 30, labourRateCents: 3000, overheadCents: 200,
        lines: [
          { id: "l2", ingredientId: "egg", componentRecipeId: null, quantity: 2, unit: "EACH" },
          { id: "l3", ingredientId: null, componentRecipeId: "dough", quantity: 500, unit: null },
        ],
      },
    ],
  ]),
};

test("costs a double batch with waste, labour, overhead and a sub-recipe", () => {
  const cost = costRecipe("cookie", ctx, 2);
  // Eggs: 2 × 1.1 waste × 2 batches = 4.4 @ 50c = 220c. Flour: 500 g × 2 = 1000 g @ 0.2c = 200c.
  assert.equal(Math.round(cost.materialCents), 420);
  assert.equal(cost.labourCents, 3000);
  assert.equal(cost.overheadCents, 400);
  assert.equal(Math.round(cost.totalCents), 3820);
  assert.ok(Math.abs((cost.requirements.get("egg") ?? 0) - 4.4) < 1e-9);
  assert.equal(cost.requirements.get("flour"), 1000);
  assert.deepEqual(cost.problems, []);
});

test("product unit cost scales by units per product and adds packaging", () => {
  assert.equal(productUnitCostCents({ batchTotalCents: 1200, yieldQuantity: 12, yieldUnitsPerProduct: 6, packagingCostCents: 50 }), 650);
});

test("detects recipe loops", () => {
  assert.equal(wouldCreateLoop("dough", "cookie", ctx), true);
  assert.equal(wouldCreateLoop("cookie", "dough", ctx), false);
  assert.equal(wouldCreateLoop("dough", "dough", ctx), true);
});

test("suggested price covers cost, fees and margin", () => {
  // (1000 + 30) / (1 - 0.5 - 0.0425) = 2251.37 → 2252
  assert.equal(suggestedPriceCents({ unitCostCents: 1000, marginPct: 50, feePct: 4.25, fixedFeeCents: 30 }), 2252);
  assert.equal(suggestedPriceCents({ unitCostCents: 1000, marginPct: 96, feePct: 5, fixedFeeCents: 0 }), null);
});
