import { convertQuantity, type Unit } from "./unit-convert";

export type CostIngredient = {
  id: string;
  name: string;
  baseUnit: Unit;
  purchaseQuantity: number;
  purchaseUnit: Unit;
  purchasePriceCents: number;
};

export type CostLine = {
  id: string;
  ingredientId: string | null;
  componentRecipeId: string | null;
  quantity: number;
  unit: Unit | null;
};

export type CostRecipe = {
  id: string;
  name: string;
  yieldQuantity: number;
  wastePercent: number;
  labourMinutes: number;
  labourRateCents: number;
  overheadCents: number;
  lines: CostLine[];
};

export type CostContext = {
  recipes: Map<string, CostRecipe>;
  ingredients: Map<string, CostIngredient>;
};

export type RecipeCost = {
  materialCents: number;
  labourCents: number;
  overheadCents: number;
  totalCents: number;
  /** Ingredient id → quantity in the ingredient's baseUnit (waste included). */
  requirements: Map<string, number>;
  /** Human-readable problems (missing price, unit mismatch, loop). */
  problems: string[];
};

/** Cents per one baseUnit, from the ingredient's current purchase price. */
export function ingredientCostPerBase(ingredient: CostIngredient): number | null {
  const packInBase = convertQuantity(
    ingredient.purchaseQuantity,
    ingredient.purchaseUnit,
    ingredient.baseUnit,
  );
  if (packInBase == null || packInBase <= 0) return null;
  return ingredient.purchasePriceCents / packInBase;
}

/** Full cost of `multiplier` batches of a recipe, including nested component recipes. */
export function costRecipe(
  recipeId: string,
  ctx: CostContext,
  multiplier = 1,
  path: ReadonlySet<string> = new Set(),
): RecipeCost {
  const result: RecipeCost = {
    materialCents: 0,
    labourCents: 0,
    overheadCents: 0,
    totalCents: 0,
    requirements: new Map(),
    problems: [],
  };
  const recipe = ctx.recipes.get(recipeId);
  if (!recipe) {
    result.problems.push("Recipe not found.");
    return result;
  }
  if (path.has(recipeId)) {
    result.problems.push(`${recipe.name} contains itself.`);
    return result;
  }
  const nextPath = new Set(path).add(recipeId);
  const wasteFactor = 1 + Math.max(0, recipe.wastePercent) / 100;
  result.labourCents = (recipe.labourMinutes / 60) * recipe.labourRateCents * multiplier;
  result.overheadCents = recipe.overheadCents * multiplier;

  for (const line of recipe.lines) {
    if (line.ingredientId) {
      const ingredient = ctx.ingredients.get(line.ingredientId);
      if (!ingredient) continue;
      const base = line.unit
        ? convertQuantity(line.quantity, line.unit, ingredient.baseUnit)
        : null;
      if (base == null) {
        result.problems.push(`${ingredient.name}: unit can't convert to ${ingredient.baseUnit}.`);
        continue;
      }
      const qty = base * wasteFactor * multiplier;
      result.requirements.set(ingredient.id, (result.requirements.get(ingredient.id) ?? 0) + qty);
      const perBase = ingredientCostPerBase(ingredient);
      if (perBase == null) result.problems.push(`${ingredient.name}: no purchase price.`);
      else result.materialCents += qty * perBase;
    } else if (line.componentRecipeId) {
      const component = ctx.recipes.get(line.componentRecipeId);
      if (!component || component.yieldQuantity <= 0) continue;
      const sub = costRecipe(
        component.id,
        ctx,
        (multiplier * line.quantity) / component.yieldQuantity,
        nextPath,
      );
      result.materialCents += sub.materialCents;
      result.labourCents += sub.labourCents;
      result.overheadCents += sub.overheadCents;
      result.problems.push(...sub.problems);
      for (const [id, qty] of sub.requirements) {
        result.requirements.set(id, (result.requirements.get(id) ?? 0) + qty);
      }
    }
  }
  result.totalCents = result.materialCents + result.labourCents + result.overheadCents;
  return result;
}

/** Cost of one sellable product unit: recipe cost per yield unit × units per product + packaging. */
export function productUnitCostCents(input: {
  batchTotalCents: number;
  yieldQuantity: number;
  yieldUnitsPerProduct: number;
  packagingCostCents: number | null;
}): number {
  const perYield = input.yieldQuantity > 0 ? input.batchTotalCents / input.yieldQuantity : 0;
  return perYield * input.yieldUnitsPerProduct + (input.packagingCostCents ?? 0);
}
