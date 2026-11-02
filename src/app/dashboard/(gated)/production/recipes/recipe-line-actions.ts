"use server";

import { requireProOwnerWrite } from "@/lib/require-pro-owner";
import { decimal, failure, text, unit, type ActionResult } from "@/lib/production/form-parse";
import {
  addOwnerRecipeLine,
  linkOwnerProduct,
  removeOwnerRecipeLine,
  unlinkOwnerProduct,
  type RecipeLineSource,
} from "@/lib/production/recipe-lines";

/** `source` is `ing:<ingredientId>` or `rec:<componentRecipeId>`. */
export async function addRecipeLine(formData: FormData): Promise<ActionResult> {
  try {
    const { owner } = await requireProOwnerWrite();
    const [kind, sourceId = ""] = text(formData, "source").split(":");
    if (kind !== "ing" && kind !== "rec") return { error: "Choose a material or recipe." };
    const source: RecipeLineSource =
      kind === "ing" ? { kind: "ing", id: sourceId, unit: unit(formData, "unit") } : { kind: "rec", id: sourceId };
    return await addOwnerRecipeLine(owner.id, text(formData, "recipeId"), source, decimal(formData, "quantity", true));
  } catch (error) {
    return failure("addRecipeLine failed", error);
  }
}

export async function removeRecipeLine(formData: FormData): Promise<ActionResult> {
  try {
    const { owner } = await requireProOwnerWrite();
    return await removeOwnerRecipeLine(owner.id, text(formData, "id"));
  } catch (error) {
    return failure("removeRecipeLine failed", error);
  }
}

export async function linkProduct(formData: FormData): Promise<ActionResult> {
  try {
    const { owner } = await requireProOwnerWrite();
    return await linkOwnerProduct(
      owner.id,
      text(formData, "recipeId"),
      text(formData, "productId"),
      decimal(formData, "yieldUnitsPerProduct", true),
    );
  } catch (error) {
    return failure("linkProduct failed", error);
  }
}

export async function unlinkProduct(formData: FormData): Promise<ActionResult> {
  try {
    const { owner } = await requireProOwnerWrite();
    return await unlinkOwnerProduct(owner.id, text(formData, "productId"));
  } catch (error) {
    return failure("unlinkProduct failed", error);
  }
}
