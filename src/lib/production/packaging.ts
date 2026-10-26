import { ingredientCostPerBase, type CostIngredient } from "./batch-costing";
import { convertQuantity, type Unit } from "./unit-convert";

export type PackagingLine = { id: string; ingredientId: string; quantity: number; unit: Unit };

/** One packaging material used for `units` products: quantity in the material's base unit, cost at today's price. */
export type PackagingUse = { ingredientId: string; name: string; quantity: number; unit: Unit; costCents: number };

export function packagingUses(
  lines: PackagingLine[],
  ingredients: ReadonlyMap<string, CostIngredient>,
  units = 1,
): PackagingUse[] {
  const uses: PackagingUse[] = [];
  for (const line of lines) {
    const material = ingredients.get(line.ingredientId);
    if (!material) continue;
    const perUnit = convertQuantity(line.quantity, line.unit, material.baseUnit);
    if (perUnit == null) continue;
    const quantity = perUnit * units;
    const perBase = ingredientCostPerBase(material) ?? 0;
    uses.push({ ingredientId: material.id, name: material.name, quantity, unit: material.baseUnit, costCents: quantity * perBase });
  }
  return uses;
}

/** Packaging cost of one product: listed materials plus the flat "other packaging" amount. */
export function packagingUnitCents(
  lines: PackagingLine[],
  ingredients: ReadonlyMap<string, CostIngredient>,
  otherCents: number | null,
): number {
  return packagingUses(lines, ingredients).reduce((sum, u) => sum + u.costCents, 0) + (otherCents ?? 0);
}
