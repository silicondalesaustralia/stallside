import type { MeasureUnit, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  ingredientLineCostCents,
  roundCents,
  toNumber,
} from "@/lib/production/costing";
import { MAX_RECIPE_NEST_DEPTH } from "@/lib/production/flatten-ingredients";
import type { MeasureUnitCode } from "@/lib/production/units";

export type RecipeCostLine = {
  kind: "ingredient" | "component";
  name: string;
  quantity: number;
  unitLabel: string;
  costCents: number;
};

export type RecipeCostResult = {
  totalCents: number;
  lines: RecipeCostLine[];
  yieldQuantity: number;
  yieldLabel: string;
  costPerYieldUnitCents: number;
};

type RecipeWithLines = Prisma.RecipeGetPayload<{
  include: {
    lines: {
      include: {
        ingredient: true;
        componentRecipe: true;
      };
      orderBy: { sortOrder: "asc" };
    };
  };
}>;

function asUnit(u: MeasureUnit | null | undefined): MeasureUnitCode {
  if (!u) throw new Error("Missing measure unit");
  return u as MeasureUnitCode;
}

export async function loadRecipeTree(
  ownerId: string,
  recipeId: string,
): Promise<RecipeWithLines | null> {
  return prisma.recipe.findFirst({
    where: { id: recipeId, ownerId },
    include: {
      lines: {
        orderBy: { sortOrder: "asc" },
        include: {
          ingredient: true,
          componentRecipe: true,
        },
      },
    },
  });
}

/**
 * Cost one recipe batch. Nested component recipes scale by
 * (line.quantity / component.yieldQuantity) batches.
 */
export async function costRecipe(
  ownerId: string,
  recipeId: string,
  stack: Set<string> = new Set(),
  depth = 0,
): Promise<RecipeCostResult> {
  if (depth > MAX_RECIPE_NEST_DEPTH) {
    throw new Error("Recipe nesting too deep (max 5)");
  }
  if (stack.has(recipeId)) {
    throw new Error("Circular recipe reference");
  }
  stack.add(recipeId);

  const recipe = await loadRecipeTree(ownerId, recipeId);
  if (!recipe || !recipe.isActive) {
    stack.delete(recipeId);
    throw new Error("Recipe not found");
  }

  const lines: RecipeCostLine[] = [];
  let total = 0;
  const yieldQuantity = toNumber(recipe.yieldQuantity);

  for (const line of recipe.lines) {
    const qty = toNumber(line.quantity);
    if (line.ingredientId && line.ingredient) {
      const ing = line.ingredient;
      const unit = asUnit(line.unit);
      const cost = ingredientLineCostCents({
        quantity: qty,
        unit,
        purchaseQuantity: toNumber(ing.purchaseQuantity),
        purchaseUnit: ing.purchaseUnit as MeasureUnitCode,
        purchasePriceCents: ing.purchasePriceCents,
        baseUnit: ing.baseUnit as MeasureUnitCode,
      });
      total += cost;
      lines.push({
        kind: "ingredient",
        name: ing.name,
        quantity: qty,
        unitLabel: unit,
        costCents: roundCents(cost),
      });
    } else if (line.componentRecipeId && line.componentRecipe) {
      const nested = await costRecipe(
        ownerId,
        line.componentRecipeId,
        stack,
        depth + 1,
      );
      const nestedYield = nested.yieldQuantity;
      const batches = nestedYield > 0 ? qty / nestedYield : 0;
      const cost = nested.totalCents * batches;
      total += cost;
      lines.push({
        kind: "component",
        name: line.componentRecipe.name,
        quantity: qty,
        unitLabel: nested.yieldLabel,
        costCents: roundCents(cost),
      });
    }
  }

  stack.delete(recipeId);
  const totalCents = roundCents(total);
  return {
    totalCents,
    lines,
    yieldQuantity,
    yieldLabel: recipe.yieldLabel,
    costPerYieldUnitCents:
      yieldQuantity > 0 ? totalCents / yieldQuantity : 0,
  };
}

export async function assertNoRecipeCycle(
  ownerId: string,
  recipeId: string,
  componentRecipeId: string,
): Promise<void> {
  if (recipeId === componentRecipeId) {
    throw new Error("A recipe cannot include itself");
  }
  const visiting = new Set<string>([recipeId]);
  async function walk(id: string, depth: number) {
    if (depth > MAX_RECIPE_NEST_DEPTH) throw new Error("Recipe nesting too deep");
    if (visiting.has(id)) throw new Error("Circular recipe reference");
    visiting.add(id);
    const lines = await prisma.recipeIngredient.findMany({
      where: {
        recipeId: id,
        componentRecipeId: { not: null },
        recipe: { ownerId },
      },
      select: { componentRecipeId: true },
    });
    for (const line of lines) {
      if (!line.componentRecipeId) continue;
      if (line.componentRecipeId === recipeId) {
        throw new Error("Circular recipe reference");
      }
      await walk(line.componentRecipeId, depth + 1);
    }
    visiting.delete(id);
  }
  await walk(componentRecipeId, 0);
}
