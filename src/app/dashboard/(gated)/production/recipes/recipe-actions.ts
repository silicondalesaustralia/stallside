"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOwnerWrite } from "@/lib/session";
import {
  cents,
  decimal,
  failure,
  optionalText,
  text,
  wholeNumber,
  type ActionResult,
} from "@/lib/production/form-parse";

export async function createRecipe(formData: FormData): Promise<ActionResult> {
  try {
    const { owner } = await requireOwnerWrite();
    const name = text(formData, "name");
    const yieldQuantity = decimal(formData, "yieldQuantity", true);
    if (!name) return { error: "Enter a recipe name." };
    if (yieldQuantity == null) return { error: "Enter how many one batch makes." };
    const recipe = await prisma.recipe.create({
      data: {
        ownerId: owner.id,
        name,
        yieldQuantity,
        yieldLabel: text(formData, "yieldLabel") || "units",
      },
    });
    revalidatePath("/dashboard/production/recipes");
    return { ok: true, redirectTo: `/dashboard/production/recipes/${recipe.id}` };
  } catch (error) {
    return failure("createRecipe failed", error);
  }
}

export async function saveRecipe(formData: FormData): Promise<ActionResult> {
  try {
    const { owner } = await requireOwnerWrite();
    const id = text(formData, "id");
    const name = text(formData, "name");
    const yieldQuantity = decimal(formData, "yieldQuantity", true);
    const wastePercent = decimal(formData, "wastePercent") ?? 0;
    const labourMinutes = wholeNumber(formData, "labourMinutes") ?? 0;
    const labourRateCents = cents(formData, "labourRate") ?? 0;
    const overheadCents = cents(formData, "overhead") ?? 0;
    if (!name) return { error: "Enter a recipe name." };
    if (yieldQuantity == null) return { error: "Enter how many one batch makes." };
    if (wastePercent > 500) return { error: "Waste must be 500% or less." };

    const result = await prisma.recipe.updateMany({
      where: { id, ownerId: owner.id },
      data: {
        name,
        yieldQuantity,
        yieldLabel: text(formData, "yieldLabel") || "units",
        wastePercent,
        labourMinutes,
        labourRateCents,
        overheadCents,
        instructions: optionalText(formData, "instructions"),
      },
    });
    if (result.count === 0) return { error: "Recipe not found." };
    revalidatePath("/dashboard/production", "layout");
    return { ok: true, message: "Saved." };
  } catch (error) {
    return failure("saveRecipe failed", error);
  }
}

export async function setRecipeActive(formData: FormData): Promise<ActionResult> {
  try {
    const { owner } = await requireOwnerWrite();
    const isActive = text(formData, "isActive") === "true";
    const result = await prisma.recipe.updateMany({
      where: { id: text(formData, "id"), ownerId: owner.id },
      data: { isActive },
    });
    if (result.count === 0) return { error: "Recipe not found." };
    revalidatePath("/dashboard/production", "layout");
    return { ok: true, message: isActive ? "Restored." : "Archived." };
  } catch (error) {
    return failure("setRecipeActive failed", error);
  }
}
