"use server";

import { requireOwnerWrite } from "@/lib/session";
import { deleteOwnerPurchase, recordOwnerPurchase } from "@/lib/production/purchases";
import {
  cents,
  dateOnly,
  decimal,
  failure,
  optionalText,
  text,
  unit,
  type ActionResult,
} from "@/lib/production/form-parse";

/** Incoming supplies: adds stock and makes this the ingredient's current price. */
export async function recordPurchase(formData: FormData): Promise<ActionResult> {
  try {
    const { owner } = await requireOwnerWrite();
    const ingredientId = text(formData, "ingredientId");
    const quantity = decimal(formData, "quantity", true);
    const purchaseUnit = unit(formData, "unit");
    const totalCents = cents(formData, "total");
    if (!ingredientId) return { error: "Choose a material." };
    if (quantity == null || !purchaseUnit) return { error: "Enter the quantity received." };
    if (totalCents == null) return { error: "Enter the total paid." };

    return await recordOwnerPurchase(owner.id, {
      ingredientId,
      quantity,
      unit: purchaseUnit,
      totalCents,
      supplier: optionalText(formData, "supplier"),
      lotCode: optionalText(formData, "lotCode"),
      expiresAt: dateOnly(formData, "expiresAt"),
      notes: optionalText(formData, "notes"),
      receivedAt: dateOnly(formData, "receivedAt"),
    });
  } catch (error) {
    return failure("recordPurchase failed", error);
  }
}

export async function deletePurchase(formData: FormData): Promise<ActionResult> {
  try {
    const { owner } = await requireOwnerWrite();
    return await deleteOwnerPurchase(owner.id, text(formData, "id"));
  } catch (error) {
    return failure("deletePurchase failed", error);
  }
}
