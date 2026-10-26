import { prisma } from "@/lib/prisma";
import type { MaterialKind } from "@/generated/prisma/client";
import type { CostContext, CostIngredient, CostRecipe } from "./batch-costing";

export type MaterialRow = CostIngredient & {
  kind: MaterialKind;
  supplier: string | null;
  sku: string | null;
  notes: string | null;
  isActive: boolean;
  onHand: number;
  reorderLevel: number | null;
};

export type RecipeRow = CostRecipe & {
  yieldLabel: string;
  isActive: boolean;
  instructions: string | null;
};

/** Every ingredient and recipe for an owner, with Decimal fields as numbers. */
export async function loadCostContext(ownerId: string): Promise<
  CostContext & { materials: MaterialRow[]; recipeRows: RecipeRow[] }
> {
  const [ingredients, recipes] = await Promise.all([
    prisma.ingredient.findMany({ where: { ownerId }, orderBy: { name: "asc" } }),
    prisma.recipe.findMany({
      where: { ownerId },
      orderBy: { name: "asc" },
      include: { lines: { orderBy: { sortOrder: "asc" } } },
    }),
  ]);

  const materials: MaterialRow[] = ingredients.map((i) => ({
    id: i.id,
    name: i.name,
    kind: i.kind,
    baseUnit: i.baseUnit,
    purchaseQuantity: Number(i.purchaseQuantity),
    purchaseUnit: i.purchaseUnit,
    purchasePriceCents: i.purchasePriceCents,
    supplier: i.supplier,
    sku: i.sku,
    notes: i.notes,
    isActive: i.isActive,
    onHand: Number(i.onHandQuantity),
    reorderLevel: i.reorderLevel == null ? null : Number(i.reorderLevel),
  }));

  const recipeRows: RecipeRow[] = recipes.map((r) => ({
    id: r.id,
    name: r.name,
    yieldQuantity: Number(r.yieldQuantity),
    yieldLabel: r.yieldLabel,
    isActive: r.isActive,
    instructions: r.instructions,
    wastePercent: Number(r.wastePercent),
    labourMinutes: r.labourMinutes,
    labourRateCents: r.labourRateCents,
    overheadCents: r.overheadCents,
    lines: r.lines.map((l) => ({
      id: l.id,
      ingredientId: l.ingredientId,
      componentRecipeId: l.componentRecipeId,
      quantity: Number(l.quantity),
      unit: l.unit,
    })),
  }));

  return {
    materials,
    recipeRows,
    ingredients: new Map(materials.map((m) => [m.id, m])),
    recipes: new Map(recipeRows.map((r) => [r.id, r])),
  };
}

export function isLowMaterial(m: MaterialRow): boolean {
  return m.reorderLevel != null && m.onHand <= m.reorderLevel;
}
