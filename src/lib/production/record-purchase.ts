import type { Prisma } from "@/generated/prisma/client";
import { convertQuantity, type Unit } from "./unit-convert";

export type PurchaseInput = {
  ingredient: { id: string; name: string; baseUnit: Unit; supplier: string | null };
  quantity: number;
  unit: Unit;
  totalCents: number;
  supplier: string | null;
  lotCode?: string | null;
  expiresAt?: Date | null;
  notes?: string | null;
  invoiceNumber?: string | null;
  receiptUrl?: string | null;
  receivedAt: Date;
};

export function purchaseUnitError(name: string, baseUnit: Unit): string {
  return `${name} is measured in ${baseUnit}; pick a matching unit.`;
}

/**
 * Adds stock and makes this the ingredient's current price (plus a cost-history row).
 * Throws when the unit can't convert to the ingredient's base unit.
 */
export async function writePurchase(tx: Prisma.TransactionClient, input: PurchaseInput): Promise<void> {
  const { ingredient, quantity, unit, totalCents, supplier } = input;
  const inBase = convertQuantity(quantity, unit, ingredient.baseUnit);
  if (inBase == null) throw new Error(purchaseUnitError(ingredient.name, ingredient.baseUnit));

  await tx.ingredientPurchase.create({
    data: {
      ingredientId: ingredient.id,
      quantity,
      unit,
      totalCents,
      supplier,
      lotCode: input.lotCode ?? null,
      expiresAt: input.expiresAt ?? null,
      notes: input.notes ?? null,
      invoiceNumber: input.invoiceNumber ?? null,
      receiptUrl: input.receiptUrl ?? null,
      receivedAt: input.receivedAt,
    },
  });
  await tx.ingredient.update({
    where: { id: ingredient.id },
    data: {
      onHandQuantity: { increment: inBase },
      purchaseQuantity: quantity,
      purchaseUnit: unit,
      purchasePriceCents: totalCents,
      supplier: supplier ?? ingredient.supplier,
    },
  });
  await tx.ingredientCostHistory.create({
    data: {
      ingredientId: ingredient.id,
      purchaseQuantity: quantity,
      purchaseUnit: unit,
      purchasePriceCents: totalCents,
      note: input.receiptUrl ? "Scanned invoice" : "Purchase",
    },
  });
}
