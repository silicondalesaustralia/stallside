import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { CostIngredient } from "./batch-costing";
import { packagingUnitCents, packagingUses } from "./packaging";

const bag: CostIngredient = { id: "bag", name: "Bread bag", baseUnit: "EACH", purchaseQuantity: 100, purchaseUnit: "EACH", purchasePriceCents: 1500 };
const ribbon: CostIngredient = { id: "rib", name: "Ribbon", baseUnit: "ML", purchaseQuantity: 1, purchaseUnit: "L", purchasePriceCents: 1000 };
const materials = new Map([[bag.id, bag], [ribbon.id, ribbon]]);

describe("packaging", () => {
  it("prices one product's packaging plus the other amount", () => {
    const lines = [{ id: "1", ingredientId: "bag", quantity: 1, unit: "EACH" as const }];
    assert.equal(packagingUnitCents(lines, materials, 20), 35);
  });

  it("scales by units made and converts units", () => {
    const uses = packagingUses([{ id: "1", ingredientId: "rib", quantity: 0.05, unit: "L" }], materials, 10);
    assert.equal(uses[0].quantity, 500);
    assert.equal(uses[0].costCents, 500);
  });
});
