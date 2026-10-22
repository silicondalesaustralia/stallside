import type { Prisma } from "@/generated/prisma/client";
import { InventorySource } from "@/generated/prisma/client";

/** Adds (or removes, when negative) finished units on a product and logs a PRODUCTION adjustment. */
export async function recordBatchStock(
  tx: Prisma.TransactionClient,
  input: {
    productId: string;
    ownerId: string;
    standId: string;
    change: number;
    reason: string;
    costCents?: number;
  },
) {
  const product = await tx.product.findUniqueOrThrow({
    where: { id: input.productId },
    select: { stockQuantity: true },
  });
  const next = product.stockQuantity + input.change;
  await tx.product.update({
    where: { id: input.productId },
    data: {
      stockQuantity: next,
      ...(input.costCents === undefined ? {} : { costCents: input.costCents }),
    },
  });
  await tx.inventoryAdjustment.create({
    data: {
      productId: input.productId,
      ownerId: input.ownerId,
      standId: input.standId,
      changeQuantity: input.change,
      previousQuantity: product.stockQuantity,
      newQuantity: next,
      reason: input.reason,
      source: InventorySource.PRODUCTION,
    },
  });
}
