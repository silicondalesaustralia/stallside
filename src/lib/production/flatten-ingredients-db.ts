import { prisma } from "@/lib/prisma";
import {
  flattenAndMergeRecipeIngredients,
  recipeToFlattenable,
  type FlatIngredientNeed,
  type FlattenableRecipe,
  MAX_RECIPE_NEST_DEPTH,
} from "@/lib/production/flatten-ingredients";

/**
 * Load a recipe and all nested component recipes (owner-scoped), then flatten
 * ingredient needs for `batchMultiplier` batches of the root recipe.
 */
export async function flattenRecipeIngredientsForOwner(
  ownerId: string,
  recipeId: string,
  batchMultiplier = 1,
): Promise<FlatIngredientNeed[]> {
  const recipesById = new Map<string, FlattenableRecipe>();
  const queue = [recipeId];
  const seen = new Set<string>();

  while (queue.length > 0) {
    const id = queue.shift()!;
    if (seen.has(id)) continue;
    seen.add(id);
    if (seen.size > MAX_RECIPE_NEST_DEPTH + 8) {
      // Safety bound for breadth; depth still enforced in flatten.
      throw new Error("Recipe graph too large");
    }

    const recipe = await prisma.recipe.findFirst({
      where: { id, ownerId, isActive: true },
      include: {
        lines: {
          orderBy: { sortOrder: "asc" },
          include: { ingredient: true },
        },
      },
    });
    if (!recipe) throw new Error("Recipe not found");

    const flat = recipeToFlattenable(recipe);
    recipesById.set(recipe.id, flat);
    for (const line of flat.lines) {
      if (line.kind === "component" && !seen.has(line.componentRecipeId)) {
        queue.push(line.componentRecipeId);
      }
    }
  }

  return flattenAndMergeRecipeIngredients(
    recipeId,
    recipesById,
    batchMultiplier,
  );
}
