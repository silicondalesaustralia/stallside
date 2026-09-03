/**
 * Nested recipe flatten + merge tests.
 * Run via: npm run test:production
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  flattenAndMergeRecipeIngredients,
  flattenRecipeIngredients,
  mergeIngredientNeeds,
  type FlattenableRecipe,
} from "./flatten-ingredients";

function flour(qty: number, unit: "G" | "KG" = "G"): FlattenableRecipe["lines"][number] {
  return {
    kind: "ingredient",
    ingredientId: "flour",
    name: "Bread flour",
    quantity: qty,
    unit,
    baseUnit: "G",
    purchaseQuantity: 12.5,
    purchaseUnit: "KG",
    purchasePriceCents: 2490,
  };
}

function milk(qty: number, unit: "ML" | "L" = "ML"): FlattenableRecipe["lines"][number] {
  return {
    kind: "ingredient",
    ingredientId: "milk",
    name: "Milk",
    quantity: qty,
    unit,
    baseUnit: "ML",
    purchaseQuantity: 2,
    purchaseUnit: "L",
    purchasePriceCents: 300,
  };
}

function butter(qty: number): FlattenableRecipe["lines"][number] {
  return {
    kind: "ingredient",
    ingredientId: "butter",
    name: "Butter",
    quantity: qty,
    unit: "G",
    baseUnit: "G",
    purchaseQuantity: 1,
    purchaseUnit: "KG",
    purchasePriceCents: 800,
  };
}

describe("flatten nested recipes", () => {
  it("flattens nested sub-recipes and merges shared flour", () => {
    const recipes = new Map<string, FlattenableRecipe>([
      [
        "dough",
        {
          id: "dough",
          yieldQuantity: 1,
          lines: [flour(500, "G"), milk(200, "ML")],
        },
      ],
      [
        "filling",
        {
          id: "filling",
          yieldQuantity: 1,
          lines: [butter(100), flour(50, "G")],
        },
      ],
      [
        "bun",
        {
          id: "bun",
          yieldQuantity: 12,
          lines: [
            { kind: "component", componentRecipeId: "dough", quantity: 1 },
            { kind: "component", componentRecipeId: "filling", quantity: 1 },
            flour(20, "G"), // dusting — same flour id
          ],
        },
      ],
    ]);

    const flat = flattenAndMergeRecipeIngredients("bun", recipes, 1);
    const byId = Object.fromEntries(flat.map((f) => [f.ingredientId, f]));

    // 500 + 50 + 20 = 570 g flour
    assert.equal(byId.flour.quantityInBase, 570);
    assert.equal(byId.flour.baseUnit, "G");
    assert.equal(byId.milk.quantityInBase, 200);
    assert.equal(byId.butter.quantityInBase, 100);
  });

  it("scales repeated sub-recipe usage and batch multipliers", () => {
    const recipes = new Map<string, FlattenableRecipe>([
      [
        "icing",
        {
          id: "icing",
          yieldQuantity: 2, // yields 2 portions
          lines: [milk(100, "ML"), butter(50)],
        },
      ],
      [
        "cake",
        {
          id: "cake",
          yieldQuantity: 1,
          lines: [
            // Uses 4 yield units of icing = 2 batches of icing recipe
            { kind: "component", componentRecipeId: "icing", quantity: 4 },
            flour(1, "KG"),
          ],
        },
      ],
    ]);

    const one = flattenAndMergeRecipeIngredients("cake", recipes, 1);
    const milkNeed = one.find((n) => n.ingredientId === "milk")!;
    // 2 icing batches × 100 ml = 200 ml
    assert.equal(milkNeed.quantityInBase, 200);
    assert.equal(one.find((n) => n.ingredientId === "flour")!.quantityInBase, 1000);

    const three = flattenAndMergeRecipeIngredients("cake", recipes, 3);
    assert.equal(
      three.find((n) => n.ingredientId === "milk")!.quantityInBase,
      600,
    );
  });

  it("normalises mixed g/kg and ml/L into base units before merge", () => {
    const recipes = new Map<string, FlattenableRecipe>([
      [
        "a",
        {
          id: "a",
          yieldQuantity: 1,
          lines: [flour(1, "KG"), milk(0.5, "L")],
        },
      ],
      [
        "b",
        {
          id: "b",
          yieldQuantity: 1,
          lines: [flour(250, "G"), milk(250, "ML")],
        },
      ],
      [
        "root",
        {
          id: "root",
          yieldQuantity: 1,
          lines: [
            { kind: "component", componentRecipeId: "a", quantity: 1 },
            { kind: "component", componentRecipeId: "b", quantity: 1 },
          ],
        },
      ],
    ]);

    const flat = flattenAndMergeRecipeIngredients("root", recipes, 1);
    const byId = Object.fromEntries(flat.map((f) => [f.ingredientId, f]));
    assert.equal(byId.flour.quantityInBase, 1250); // 1000 + 250 g
    assert.equal(byId.milk.quantityInBase, 750); // 500 + 250 ml
  });

  it("rejects circular recipe references", () => {
    const recipes = new Map<string, FlattenableRecipe>([
      [
        "a",
        {
          id: "a",
          yieldQuantity: 1,
          lines: [{ kind: "component", componentRecipeId: "b", quantity: 1 }],
        },
      ],
      [
        "b",
        {
          id: "b",
          yieldQuantity: 1,
          lines: [{ kind: "component", componentRecipeId: "a", quantity: 1 }],
        },
      ],
    ]);

    assert.throws(
      () => flattenRecipeIngredients("a", recipes, 1),
      /Circular recipe reference/,
    );
  });

  it("rejects self-reference and excessive depth", () => {
    const self = new Map<string, FlattenableRecipe>([
      [
        "x",
        {
          id: "x",
          yieldQuantity: 1,
          lines: [{ kind: "component", componentRecipeId: "x", quantity: 1 }],
        },
      ],
    ]);
    assert.throws(
      () => flattenRecipeIngredients("x", self, 1),
      /Circular recipe reference/,
    );

    const chain = new Map<string, FlattenableRecipe>();
    for (let i = 0; i < 8; i += 1) {
      const id = `r${i}`;
      const next = `r${i + 1}`;
      chain.set(id, {
        id,
        yieldQuantity: 1,
        lines:
          i < 7
            ? [{ kind: "component", componentRecipeId: next, quantity: 1 }]
            : [flour(10)],
      });
    }
    assert.throws(
      () => flattenRecipeIngredients("r0", chain, 1),
      /nesting too deep/,
    );
  });

  it("mergeIngredientNeeds combines duplicate ids", () => {
    const merged = mergeIngredientNeeds([
      {
        ingredientId: "flour",
        name: "Flour",
        baseUnit: "G",
        quantityInBase: 100,
        costCents: 10,
      },
      {
        ingredientId: "flour",
        name: "Flour",
        baseUnit: "G",
        quantityInBase: 50,
        costCents: 5,
      },
    ]);
    assert.equal(merged.length, 1);
    assert.equal(merged[0].quantityInBase, 150);
    assert.equal(merged[0].costCents, 15);
  });
});
