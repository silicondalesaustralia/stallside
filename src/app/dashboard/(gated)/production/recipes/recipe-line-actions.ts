"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOwnerWrite } from "@/lib/session";
import { wouldCreateLoop } from "@/lib/production/recipe-graph";
import { loadCostContext } from "@/lib/production/load-cost-context";
import { convertQuantity } from "@/lib/production/unit-convert";
import { cents, decimal, failure, text, unit, type ActionResult } from "@/lib/production/form-parse";

/** `source` is `ing:<ingredientId>` or `rec:<componentRecipeId>`. */
export async function addRecipeLine(formData: FormData): Promise<ActionResult> {
  try {
    const { owner } = await requireOwnerWrite();
    const recipeId = text(formData, "recipeId");
    const [kind, sourceId] = text(formData, "source").split(":");
    const quantity = decimal(formData, "quantity", true);
    if (!sourceId || (kind !== "ing" && kind !== "rec")) return { error: "Choose a material or recipe." };
    if (quantity == null) return { error: "Enter a quantity." };

    const ctx = await loadCostContext(owner.id);
    const recipe = ctx.recipes.get(recipeId);
    if (!recipe) return { error: "Recipe not found." };
    const sortOrder = recipe.lines.length;

    if (kind === "ing") {
      const ingredient = ctx.ingredients.get(sourceId);
      const lineUnit = unit(formData, "unit");
      if (!ingredient || !lineUnit) return { error: "Material not found." };
      if (convertQuantity(1, lineUnit, ingredient.baseUnit) == null) {
        return { error: `${ingredient.name} is measured in ${ingredient.baseUnit}; pick a matching unit.` };
      }
      await prisma.recipeIngredient.create({
        data: { recipeId, ingredientId: sourceId, quantity, unit: lineUnit, sortOrder },
      });
    } else {
      if (!ctx.recipes.has(sourceId)) return { error: "Recipe not found." };
      if (wouldCreateLoop(recipeId, sourceId, ctx)) {
        return { error: "That recipe already uses this one, so it can't be added here." };
      }
      await prisma.recipeIngredient.create({
        data: { recipeId, componentRecipeId: sourceId, quantity, sortOrder },
      });
    }
    revalidatePath("/dashboard/production", "layout");
    return { ok: true };
  } catch (error) {
    return failure("addRecipeLine failed", error);
  }
}

export async function removeRecipeLine(formData: FormData): Promise<ActionResult> {
  try {
    const { owner } = await requireOwnerWrite();
    const result = await prisma.recipeIngredient.deleteMany({
      where: { id: text(formData, "id"), recipe: { ownerId: owner.id } },
    });
    if (result.count === 0) return { error: "Line not found." };
    revalidatePath("/dashboard/production", "layout");
    return { ok: true };
  } catch (error) {
    return failure("removeRecipeLine failed", error);
  }
}

export async function linkProduct(formData: FormData): Promise<ActionResult> {
  try {
    const { owner } = await requireOwnerWrite();
    const recipeId = text(formData, "recipeId");
    const productId = text(formData, "productId");
    const yieldUnitsPerProduct = decimal(formData, "yieldUnitsPerProduct", true);
    if (yieldUnitsPerProduct == null) return { error: "Enter how many recipe units go in one product." };
    const [recipe, product] = await Promise.all([
      prisma.recipe.findFirst({ where: { id: recipeId, ownerId: owner.id }, select: { id: true } }),
      prisma.product.findFirst({ where: { id: productId, ownerId: owner.id }, select: { id: true } }),
    ]);
    if (!recipe || !product) return { error: "Choose a product." };
    await prisma.$transaction([
      prisma.productRecipe.upsert({
        where: { productId },
        create: { productId, recipeId, yieldUnitsPerProduct },
        update: { recipeId, yieldUnitsPerProduct },
      }),
      prisma.product.update({
        where: { id: productId },
        data: { packagingCostCents: cents(formData, "packaging") },
      }),
    ]);
    revalidatePath("/dashboard/production", "layout");
    return { ok: true, message: "Product linked." };
  } catch (error) {
    return failure("linkProduct failed", error);
  }
}

export async function unlinkProduct(formData: FormData): Promise<ActionResult> {
  try {
    const { owner } = await requireOwnerWrite();
    const result = await prisma.productRecipe.deleteMany({
      where: { productId: text(formData, "productId"), product: { ownerId: owner.id } },
    });
    if (result.count === 0) return { error: "Link not found." };
    revalidatePath("/dashboard/production", "layout");
    return { ok: true };
  } catch (error) {
    return failure("unlinkProduct failed", error);
  }
}
