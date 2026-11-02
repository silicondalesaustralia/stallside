import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { wouldCreateLoop } from "./recipe-graph";
import { loadCostContext } from "./load-cost-context";
import { convertQuantity, type Unit } from "./unit-convert";

export type RecipeLineSource =
  | { kind: "ing"; id: string; unit: Unit | null }
  | { kind: "rec"; id: string };

type Result = { ok: true; message?: string } | { error: string };

/** Adds a material (in a matching unit) or a sub-recipe (in its yield units) to a recipe. */
export async function addOwnerRecipeLine(
  ownerId: string,
  recipeId: string,
  source: RecipeLineSource,
  quantity: number | null,
): Promise<Result> {
  if (!source.id) return { error: "Choose a material or recipe." };
  if (quantity == null || !(quantity > 0)) return { error: "Enter a quantity." };

  const ctx = await loadCostContext(ownerId);
  const recipe = ctx.recipes.get(recipeId);
  if (!recipe) return { error: "Recipe not found." };
  const sortOrder = recipe.lines.length;

  if (source.kind === "ing") {
    const ingredient = ctx.ingredients.get(source.id);
    if (!ingredient || !source.unit) return { error: "Material not found." };
    if (convertQuantity(1, source.unit, ingredient.baseUnit) == null) {
      return { error: `${ingredient.name} is measured in ${ingredient.baseUnit}; pick a matching unit.` };
    }
    await prisma.recipeIngredient.create({
      data: { recipeId, ingredientId: source.id, quantity, unit: source.unit, sortOrder },
    });
  } else {
    if (!ctx.recipes.has(source.id)) return { error: "Recipe not found." };
    if (wouldCreateLoop(recipeId, source.id, ctx)) {
      return { error: "That recipe already uses this one, so it can't be added here." };
    }
    await prisma.recipeIngredient.create({ data: { recipeId, componentRecipeId: source.id, quantity, sortOrder } });
  }
  revalidatePath("/dashboard/production", "layout");
  return { ok: true };
}

export async function removeOwnerRecipeLine(ownerId: string, lineId: string): Promise<Result> {
  const result = await prisma.recipeIngredient.deleteMany({ where: { id: lineId, recipe: { ownerId } } });
  if (result.count === 0) return { error: "Line not found." };
  revalidatePath("/dashboard/production", "layout");
  return { ok: true };
}

/** Links a product to a recipe (a product has at most one recipe). */
export async function linkOwnerProduct(
  ownerId: string,
  recipeId: string,
  productId: string,
  yieldUnitsPerProduct: number | null,
): Promise<Result> {
  if (yieldUnitsPerProduct == null || !(yieldUnitsPerProduct > 0)) {
    return { error: "Enter how many recipe units go in one product." };
  }
  const [recipe, product] = await Promise.all([
    prisma.recipe.findFirst({ where: { id: recipeId, ownerId }, select: { id: true } }),
    prisma.product.findFirst({ where: { id: productId, ownerId }, select: { id: true } }),
  ]);
  if (!recipe || !product) return { error: "Choose a product." };
  await prisma.productRecipe.upsert({
    where: { productId },
    create: { productId, recipeId, yieldUnitsPerProduct },
    update: { recipeId, yieldUnitsPerProduct },
  });
  revalidatePath("/dashboard/production", "layout");
  return { ok: true, message: "Product linked." };
}

export async function unlinkOwnerProduct(ownerId: string, productId: string): Promise<Result> {
  const result = await prisma.productRecipe.deleteMany({ where: { productId, product: { ownerId } } });
  if (result.count === 0) return { error: "Link not found." };
  revalidatePath("/dashboard/production", "layout");
  return { ok: true };
}
