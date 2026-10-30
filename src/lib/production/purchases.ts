import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { convertQuantity, formatQuantity, type Unit } from "./unit-convert";
import { purchaseUnitError, writePurchase } from "./record-purchase";
import type { ActionResult } from "./form-parse";

export type OwnerPurchaseInput = {
  ingredientId: string;
  quantity: number;
  unit: Unit;
  totalCents: number;
  supplier: string | null;
  lotCode: string | null;
  expiresAt: Date | null;
  notes: string | null;
  receivedAt: Date | null;
};

/** Incoming supplies: adds stock and makes this the material's current price. */
export async function recordOwnerPurchase(ownerId: string, input: OwnerPurchaseInput): Promise<ActionResult> {
  const ingredient = await prisma.ingredient.findFirst({
    where: { id: input.ingredientId, ownerId },
    select: { id: true, name: true, baseUnit: true, supplier: true },
  });
  if (!ingredient) return { error: "Material not found." };
  if (convertQuantity(input.quantity, input.unit, ingredient.baseUnit) == null) {
    return { error: purchaseUnitError(ingredient.name, ingredient.baseUnit) };
  }

  await prisma.$transaction((tx) =>
    writePurchase(tx, {
      ingredient,
      quantity: input.quantity,
      unit: input.unit,
      totalCents: input.totalCents,
      supplier: input.supplier,
      lotCode: input.lotCode,
      expiresAt: input.expiresAt,
      notes: input.notes,
      receivedAt: input.receivedAt ?? new Date(),
    }),
  );

  revalidatePath("/dashboard/production", "layout");
  return { ok: true, message: `Added ${formatQuantity(input.quantity, input.unit)} of ${ingredient.name}.` };
}

/** Removes a purchase and takes its quantity back out of stock. */
export async function deleteOwnerPurchase(ownerId: string, purchaseId: string): Promise<ActionResult> {
  const purchase = await prisma.ingredientPurchase.findFirst({
    where: { id: purchaseId, ingredient: { ownerId } },
    include: { ingredient: { select: { baseUnit: true } } },
  });
  if (!purchase) return { error: "Purchase not found." };
  const inBase = convertQuantity(Number(purchase.quantity), purchase.unit, purchase.ingredient.baseUnit) ?? 0;
  await prisma.$transaction([
    prisma.ingredientPurchase.delete({ where: { id: purchaseId } }),
    prisma.ingredient.update({
      where: { id: purchase.ingredientId },
      data: { onHandQuantity: { decrement: inBase } },
    }),
  ]);
  revalidatePath("/dashboard/production", "layout");
  return { ok: true, message: "Purchase removed and stock reduced." };
}
