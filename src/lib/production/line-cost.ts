import { ingredientCostPerBase, type CostContext, type CostLine } from "./batch-costing";
import { convertQuantity } from "./unit-convert";

/** One material line's cost at today's prices, waste included; null for sub-recipes or missing prices. */
export function recipeLineCostCents(line: CostLine, ctx: CostContext, wasteFactor: number): number | null {
  if (!line.ingredientId || !line.unit) return null;
  const ingredient = ctx.ingredients.get(line.ingredientId);
  const perBase = ingredient ? ingredientCostPerBase(ingredient) : null;
  const base = ingredient ? convertQuantity(line.quantity, line.unit, ingredient.baseUnit) : null;
  return perBase == null || base == null ? null : perBase * base * wasteFactor;
}
