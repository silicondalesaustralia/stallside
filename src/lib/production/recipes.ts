import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type NewRecipeInput = {
  name: string;
  /** Null when blank or not above zero. */
  yieldQuantity: number | null;
  yieldLabel: string;
};

export type RecipeSettingsInput = NewRecipeInput & {
  wastePercent: number;
  labourMinutes: number;
  labourRateCents: number;
  overheadCents: number;
  instructions: string | null;
};

type Result = { ok: true; message?: string } | { error: string };

function checkBasics(input: NewRecipeInput): string | null {
  if (!input.name.trim()) return "Enter a recipe name.";
  if (input.yieldQuantity == null || !(input.yieldQuantity > 0)) return "Enter how many one batch makes.";
  return null;
}

/** Creates a recipe; lines, costs and products are added on its page. */
export async function createOwnerRecipe(
  ownerId: string,
  input: NewRecipeInput,
): Promise<{ ok: true; recipeId: string } | { error: string }> {
  const problem = checkBasics(input);
  if (problem || input.yieldQuantity == null) return { error: problem ?? "Enter how many one batch makes." };
  const recipe = await prisma.recipe.create({
    data: {
      ownerId,
      name: input.name.trim(),
      yieldQuantity: input.yieldQuantity,
      yieldLabel: input.yieldLabel.trim() || "units",
    },
  });
  revalidatePath("/dashboard/production/recipes");
  return { ok: true, recipeId: recipe.id };
}

/** Saves the Recipe settings form (yield, waste, labour, overhead, method). */
export async function saveOwnerRecipe(ownerId: string, recipeId: string, input: RecipeSettingsInput): Promise<Result> {
  const problem = checkBasics(input);
  if (problem || input.yieldQuantity == null) return { error: problem ?? "Enter how many one batch makes." };
  if (input.wastePercent > 500) return { error: "Waste must be 500% or less." };
  const result = await prisma.recipe.updateMany({
    where: { id: recipeId, ownerId },
    data: {
      name: input.name.trim(),
      yieldQuantity: input.yieldQuantity,
      yieldLabel: input.yieldLabel.trim() || "units",
      wastePercent: input.wastePercent,
      labourMinutes: input.labourMinutes,
      labourRateCents: input.labourRateCents,
      overheadCents: input.overheadCents,
      instructions: input.instructions?.trim() || null,
    },
  });
  if (result.count === 0) return { error: "Recipe not found." };
  revalidatePath("/dashboard/production", "layout");
  return { ok: true, message: "Saved." };
}

/** Archives or restores a recipe. */
export async function setOwnerRecipeActive(ownerId: string, recipeId: string, isActive: boolean): Promise<Result> {
  const result = await prisma.recipe.updateMany({ where: { id: recipeId, ownerId }, data: { isActive } });
  if (result.count === 0) return { error: "Recipe not found." };
  revalidatePath("/dashboard/production", "layout");
  return { ok: true, message: isActive ? "Restored." : "Archived." };
}
