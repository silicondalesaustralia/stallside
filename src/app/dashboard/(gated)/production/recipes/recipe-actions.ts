"use server";

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
import { createOwnerRecipe, saveOwnerRecipe, setOwnerRecipeActive } from "@/lib/production/recipes";

export async function createRecipe(formData: FormData): Promise<ActionResult> {
  try {
    const { owner } = await requireOwnerWrite();
    const result = await createOwnerRecipe(owner.id, {
      name: text(formData, "name"),
      yieldQuantity: decimal(formData, "yieldQuantity", true),
      yieldLabel: text(formData, "yieldLabel"),
    });
    if ("error" in result) return result;
    return { ok: true, redirectTo: `/dashboard/production/recipes/${result.recipeId}` };
  } catch (error) {
    return failure("createRecipe failed", error);
  }
}

export async function saveRecipe(formData: FormData): Promise<ActionResult> {
  try {
    const { owner } = await requireOwnerWrite();
    return await saveOwnerRecipe(owner.id, text(formData, "id"), {
      name: text(formData, "name"),
      yieldQuantity: decimal(formData, "yieldQuantity", true),
      yieldLabel: text(formData, "yieldLabel"),
      wastePercent: decimal(formData, "wastePercent") ?? 0,
      labourMinutes: wholeNumber(formData, "labourMinutes") ?? 0,
      labourRateCents: cents(formData, "labourRate") ?? 0,
      overheadCents: cents(formData, "overhead") ?? 0,
      instructions: optionalText(formData, "instructions"),
    });
  } catch (error) {
    return failure("saveRecipe failed", error);
  }
}

export async function setRecipeActive(formData: FormData): Promise<ActionResult> {
  try {
    const { owner } = await requireOwnerWrite();
    return await setOwnerRecipeActive(owner.id, text(formData, "id"), text(formData, "isActive") === "true");
  } catch (error) {
    return failure("setRecipeActive failed", error);
  }
}
