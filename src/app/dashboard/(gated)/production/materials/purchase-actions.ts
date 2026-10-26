"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOwnerWrite } from "@/lib/session";
import { convertQuantity, formatQuantity } from "@/lib/production/unit-convert";
import { purchaseUnitError, writePurchase } from "@/lib/production/record-purchase";
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

    const ingredient = await prisma.ingredient.findFirst({
      where: { id: ingredientId, ownerId: owner.id },
      select: { id: true, name: true, baseUnit: true, supplier: true },
    });
    if (!ingredient) return { error: "Material not found." };
    if (convertQuantity(quantity, purchaseUnit, ingredient.baseUnit) == null) {
      return { error: purchaseUnitError(ingredient.name, ingredient.baseUnit) };
    }

    await prisma.$transaction((tx) =>
      writePurchase(tx, {
        ingredient,
        quantity,
        unit: purchaseUnit,
        totalCents,
        supplier: optionalText(formData, "supplier"),
        lotCode: optionalText(formData, "lotCode"),
        expiresAt: dateOnly(formData, "expiresAt"),
        notes: optionalText(formData, "notes"),
        receivedAt: dateOnly(formData, "receivedAt") ?? new Date(),
      }),
    );

    revalidatePath("/dashboard/production", "layout");
    return { ok: true, message: `Added ${formatQuantity(quantity, purchaseUnit)} of ${ingredient.name}.` };
  } catch (error) {
    return failure("recordPurchase failed", error);
  }
}

export async function deletePurchase(formData: FormData): Promise<ActionResult> {
  try {
    const { owner } = await requireOwnerWrite();
    const id = text(formData, "id");
    const purchase = await prisma.ingredientPurchase.findFirst({
      where: { id, ingredient: { ownerId: owner.id } },
      include: { ingredient: { select: { baseUnit: true } } },
    });
    if (!purchase) return { error: "Purchase not found." };
    const inBase = convertQuantity(Number(purchase.quantity), purchase.unit, purchase.ingredient.baseUnit) ?? 0;
    await prisma.$transaction([
      prisma.ingredientPurchase.delete({ where: { id } }),
      prisma.ingredient.update({
        where: { id: purchase.ingredientId },
        data: { onHandQuantity: { decrement: inBase } },
      }),
    ]);
    revalidatePath("/dashboard/production", "layout");
    return { ok: true, message: "Purchase removed and stock reduced." };
  } catch (error) {
    return failure("deletePurchase failed", error);
  }
}
