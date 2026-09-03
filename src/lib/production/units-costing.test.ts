/**
 * Phase 6 unit + costing tests.
 * Run: npm run test:production
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  batchesForProductDemand,
  centsPerBaseUnit,
  contributionCents,
  costPerYieldUnitCents,
  ingredientLineCostCents,
  roundCents,
  surplusFromBatches,
} from "./costing";
import {
  convertMeasure,
  preferDisplayUnit,
  unitsCompatible,
} from "./units";

describe("units", () => {
  it("converts kg ↔ g and L ↔ ml", () => {
    assert.equal(convertMeasure(1, "KG", "G"), 1000);
    assert.equal(convertMeasure(500, "G", "KG"), 0.5);
    assert.equal(convertMeasure(1, "L", "ML"), 1000);
    assert.equal(convertMeasure(250, "ML", "L"), 0.25);
  });

  it("rejects incompatible conversions", () => {
    assert.throws(() => convertMeasure(1, "G", "ML"));
    assert.equal(unitsCompatible("G", "KG"), true);
    assert.equal(unitsCompatible("G", "ML"), false);
  });

  it("prefers display units", () => {
    assert.deepEqual(preferDisplayUnit(18400, "weight"), {
      quantity: 18.4,
      unit: "KG",
    });
    assert.deepEqual(preferDisplayUnit(420, "weight"), {
      quantity: 420,
      unit: "G",
    });
  });
});

describe("costing", () => {
  it("computes base cost from purchase", () => {
    // 12.5 kg for $24.90 → 199.2 cents/kg
    const perKg = centsPerBaseUnit({
      purchaseQuantity: 12.5,
      purchaseUnit: "KG",
      purchasePriceCents: 2490,
      baseUnit: "KG",
    });
    assert.ok(Math.abs(perKg - 199.2) < 0.0001);

    const flourLine = ingredientLineCostCents({
      quantity: 1000,
      unit: "G",
      purchaseQuantity: 12.5,
      purchaseUnit: "KG",
      purchasePriceCents: 2490,
      baseUnit: "KG",
    });
    // 1 kg of flour → ~199.2 cents
    assert.equal(roundCents(flourLine), 199);
  });

  it("eggs each", () => {
    const per = centsPerBaseUnit({
      purchaseQuantity: 30,
      purchaseUnit: "EACH",
      purchasePriceCents: 1200,
      baseUnit: "EACH",
    });
    assert.equal(per, 40);
  });

  it("yield and batches", () => {
    assert.equal(costPerYieldUnitCents(960, 12), 80);
    const exact = batchesForProductDemand({
      productUnits: 25,
      yieldUnitsPerProduct: 1,
      recipeYieldQuantity: 2,
    });
    assert.equal(exact, 12.5);
    assert.equal(Math.ceil(exact - 1e-9), 13);
    assert.equal(
      surplusFromBatches({
        exactBatches: 12.5,
        suggestedBatches: 13,
        recipeYieldQuantity: 2,
      }),
      1,
    );
  });

  it("box of 6 from yield 12", () => {
    const batches = batchesForProductDemand({
      productUnits: 10,
      yieldUnitsPerProduct: 6,
      recipeYieldQuantity: 12,
    });
    assert.equal(batches, 5);
  });

  it("contribution", () => {
    assert.equal(
      contributionCents({
        revenueCents: 112600,
        ingredientCostCents: 28400,
      }),
      84200,
    );
  });
});
