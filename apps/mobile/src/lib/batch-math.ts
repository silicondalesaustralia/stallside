import type { BatchRecipeOptionDto } from "@contracts/mobile/production";

/** Sellable units a run should give, as on the web form: yield × batches ÷ yield units per product. */
export function expectedUnits(
  recipe: BatchRecipeOptionDto | undefined,
  count: number,
  productId: string | null,
): number {
  if (!recipe || !productId || !(count > 0)) return 0;
  const perProduct =
    recipe.productId === productId ? (recipe.yieldUnitsPerProduct ?? 1) : 1;
  return Math.max(0, Math.floor((recipe.yieldQuantity * count) / perProduct));
}

export function parseCount(value: string): number {
  const count = Number(value.trim());
  return Number.isFinite(count) ? count : 0;
}
