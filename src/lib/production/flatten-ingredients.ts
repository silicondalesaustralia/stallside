import {
  convertMeasure,
  measureFamily,
  type MeasureUnitCode,
} from "@/lib/production/units";
import {
  ingredientLineCostCents,
  toNumber,
} from "@/lib/production/costing";

/** Shared with costRecipe / assertNoRecipeCycle. */
export const MAX_RECIPE_NEST_DEPTH = 5;

export type FlatIngredientNeed = {
  ingredientId: string;
  name: string;
  baseUnit: MeasureUnitCode;
  /** Quantity in the ingredient's base unit. */
  quantityInBase: number;
  /** Unrounded fractional cents for this contribution. */
  costCents: number;
};

export type FlattenIngredientLine = {
  kind: "ingredient";
  ingredientId: string;
  name: string;
  quantity: number;
  unit: MeasureUnitCode;
  baseUnit: MeasureUnitCode;
  purchaseQuantity: number;
  purchaseUnit: MeasureUnitCode;
  purchasePriceCents: number;
};

export type FlattenComponentLine = {
  kind: "component";
  componentRecipeId: string;
  /** Yield units of the component recipe consumed. */
  quantity: number;
};

export type FlattenableRecipe = {
  id: string;
  yieldQuantity: number;
  lines: Array<FlattenIngredientLine | FlattenComponentLine>;
};

/**
 * Recursively expand a recipe into raw ingredient needs in each ingredient's
 * base unit. Scales by `batchMultiplier` (1 = one batch of the root recipe).
 * Component lines scale as (lineQty / componentYield) batches.
 */
export function flattenRecipeIngredients(
  recipeId: string,
  recipesById: Map<string, FlattenableRecipe>,
  batchMultiplier = 1,
  stack: Set<string> = new Set(),
  depth = 0,
): FlatIngredientNeed[] {
  if (depth > MAX_RECIPE_NEST_DEPTH) {
    throw new Error("Recipe nesting too deep (max 5)");
  }
  if (stack.has(recipeId)) {
    throw new Error("Circular recipe reference");
  }

  const recipe = recipesById.get(recipeId);
  if (!recipe) throw new Error("Recipe not found");

  stack.add(recipeId);
  const out: FlatIngredientNeed[] = [];

  try {
    for (const line of recipe.lines) {
      if (line.kind === "ingredient") {
        const qtyBase =
          convertMeasure(line.quantity, line.unit, line.baseUnit) *
          batchMultiplier;
        const cost =
          ingredientLineCostCents({
            quantity: line.quantity,
            unit: line.unit,
            purchaseQuantity: line.purchaseQuantity,
            purchaseUnit: line.purchaseUnit,
            purchasePriceCents: line.purchasePriceCents,
            baseUnit: line.baseUnit,
          }) * batchMultiplier;
        out.push({
          ingredientId: line.ingredientId,
          name: line.name,
          baseUnit: line.baseUnit,
          quantityInBase: qtyBase,
          costCents: cost,
        });
      } else {
        const nested = recipesById.get(line.componentRecipeId);
        if (!nested) throw new Error("Component recipe not found");
        const nestedYield = nested.yieldQuantity;
        const nestedBatches =
          nestedYield > 0
            ? (line.quantity / nestedYield) * batchMultiplier
            : 0;
        out.push(
          ...flattenRecipeIngredients(
            line.componentRecipeId,
            recipesById,
            nestedBatches,
            stack,
            depth + 1,
          ),
        );
      }
    }
  } finally {
    stack.delete(recipeId);
  }

  return out;
}

/** Combine needs that share the same ingredient id (canonical base units). */
export function mergeIngredientNeeds(
  needs: FlatIngredientNeed[],
): FlatIngredientNeed[] {
  const map = new Map<string, FlatIngredientNeed>();
  for (const need of needs) {
    const prev = map.get(need.ingredientId);
    if (prev) {
      if (prev.baseUnit !== need.baseUnit) {
        // Same ingredient must keep one base unit; convert if families match.
        if (measureFamily(prev.baseUnit) !== measureFamily(need.baseUnit)) {
          throw new Error(
            `Incompatible base units for ${need.name}: ${prev.baseUnit} vs ${need.baseUnit}`,
          );
        }
        prev.quantityInBase += convertMeasure(
          need.quantityInBase,
          need.baseUnit,
          prev.baseUnit,
        );
      } else {
        prev.quantityInBase += need.quantityInBase;
      }
      prev.costCents += need.costCents;
    } else {
      map.set(need.ingredientId, { ...need });
    }
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function flattenAndMergeRecipeIngredients(
  recipeId: string,
  recipesById: Map<string, FlattenableRecipe>,
  batchMultiplier = 1,
): FlatIngredientNeed[] {
  return mergeIngredientNeeds(
    flattenRecipeIngredients(recipeId, recipesById, batchMultiplier),
  );
}

/** Build a FlattenableRecipe map entry from a loaded Prisma recipe tree node. */
export function recipeToFlattenable(recipe: {
  id: string;
  yieldQuantity: { toString(): string } | number;
  lines: Array<{
    quantity: { toString(): string } | number;
    unit: string | null;
    ingredientId: string | null;
    componentRecipeId: string | null;
    ingredient: {
      id: string;
      name: string;
      baseUnit: string;
      purchaseQuantity: { toString(): string } | number;
      purchaseUnit: string;
      purchasePriceCents: number;
    } | null;
  }>;
}): FlattenableRecipe {
  const lines: Array<FlattenIngredientLine | FlattenComponentLine> = [];
  for (const line of recipe.lines) {
    if (line.ingredientId && line.ingredient && line.unit) {
      const ing = line.ingredient;
      lines.push({
        kind: "ingredient",
        ingredientId: ing.id,
        name: ing.name,
        quantity: toNumber(line.quantity),
        unit: line.unit as MeasureUnitCode,
        baseUnit: ing.baseUnit as MeasureUnitCode,
        purchaseQuantity: toNumber(ing.purchaseQuantity),
        purchaseUnit: ing.purchaseUnit as MeasureUnitCode,
        purchasePriceCents: ing.purchasePriceCents,
      });
    } else if (line.componentRecipeId) {
      lines.push({
        kind: "component",
        componentRecipeId: line.componentRecipeId,
        quantity: toNumber(line.quantity),
      });
    }
  }
  return {
    id: recipe.id,
    yieldQuantity: toNumber(recipe.yieldQuantity),
    lines,
  };
}
