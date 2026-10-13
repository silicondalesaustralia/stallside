import {
  convertMeasure,
  type MeasureUnitCode,
  unitsCompatible,
} from "@/lib/production/units";

/**
 * Costing helpers. Money stays in integer cents at boundaries.
 * Intermediate: micro-cents (1e-6 of a cent) to reduce nested rounding drift.
 */

export function toNumber(value: { toString(): string } | number | string): number {
  if (typeof value === "number") return value;
  return Number.parseFloat(value.toString());
}

/** Cents (integer) for purchasing `purchaseQty` of `purchaseUnit`. */
export function centsPerBaseUnit(input: {
  purchaseQuantity: number;
  purchaseUnit: MeasureUnitCode;
  purchasePriceCents: number;
  baseUnit: MeasureUnitCode;
}): number {
  const { purchaseQuantity, purchaseUnit, purchasePriceCents, baseUnit } = input;
  if (purchaseQuantity <= 0) throw new Error("Purchase quantity must be > 0");
  if (purchasePriceCents < 0) throw new Error("Purchase price must be ≥ 0");
  if (!unitsCompatible(purchaseUnit, baseUnit)) {
    throw new Error("Purchase unit incompatible with base unit");
  }
  const qtyInBase = convertMeasure(purchaseQuantity, purchaseUnit, baseUnit);
  if (qtyInBase <= 0) throw new Error("Invalid purchase quantity");
  // Return fractional cents per base unit (caller rounds at display).
  return purchasePriceCents / qtyInBase;
}

export function ingredientLineCostCents(input: {
  quantity: number;
  unit: MeasureUnitCode;
  purchaseQuantity: number;
  purchaseUnit: MeasureUnitCode;
  purchasePriceCents: number;
  baseUnit: MeasureUnitCode;
}): number {
  const perBase = centsPerBaseUnit(input);
  const qtyBase = convertMeasure(input.quantity, input.unit, input.baseUnit);
  return qtyBase * perBase;
}

/** Round money for display / storage — half-up to nearest cent. */
export function roundCents(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value);
}

export function costPerYieldUnitCents(
  recipeCostCents: number,
  yieldQuantity: number,
): number {
  if (yieldQuantity <= 0) return 0;
  return recipeCostCents / yieldQuantity;
}

/**
 * Batches of recipe needed for `productUnits` sold when each product
 * contains `yieldUnitsPerProduct` of the recipe yield.
 */
export function batchesForProductDemand(input: {
  productUnits: number;
  yieldUnitsPerProduct: number;
  recipeYieldQuantity: number;
}): number {
  const { productUnits, yieldUnitsPerProduct, recipeYieldQuantity } = input;
  if (recipeYieldQuantity <= 0) return 0;
  const yieldNeeded = productUnits * yieldUnitsPerProduct;
  return yieldNeeded / recipeYieldQuantity;
}

export function suggestWholeBatches(exactBatches: number): {
  exact: number;
  suggested: number;
  surplusYieldUnits: number;
  recipeYieldQuantity: number;
} {
  const exact = Math.max(0, exactBatches);
  const suggested = exact <= 0 ? 0 : Math.ceil(exact - 1e-9);
  return {
    exact,
    suggested,
    surplusYieldUnits: 0,
    recipeYieldQuantity: 0,
  };
}

export function surplusFromBatches(input: {
  exactBatches: number;
  suggestedBatches: number;
  recipeYieldQuantity: number;
}): number {
  const extra = Math.max(0, input.suggestedBatches - input.exactBatches);
  return extra * input.recipeYieldQuantity;
}

export function contributionCents(input: {
  revenueCents: number;
  ingredientCostCents: number;
  packagingCostCents?: number;
}): number {
  return (
    input.revenueCents -
    roundCents(input.ingredientCostCents) -
    (input.packagingCostCents ?? 0)
  );
}

export function costPercentOfPrice(
  costCents: number,
  priceCents: number,
): number | null {
  if (priceCents <= 0) return null;
  return (costCents / priceCents) * 100;
}
