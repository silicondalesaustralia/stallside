import type { Prisma } from "@/generated/prisma/client";
import { InventorySource } from "@/generated/prisma/client";

type Tx = Prisma.TransactionClient;

/** Remove qty from this supplier's ACTIVE lots (newest first), then product stock. */
export async function removeSupplierContribution(
  tx: Tx,
  input: {
    productId: string;
    ownerId: string;
    standId: string;
    memberId: string;
    memberName: string;
    quantity: number;
  },
) {
  const lots = await tx.stockLot.findMany({
    where: {
      productId: input.productId,
      memberId: input.memberId,
      status: "ACTIVE",
      quantityRemaining: { gt: 0 },
    },
    orderBy: { createdAt: "desc" },
  });
  const available = lots.reduce((sum, lot) => sum + lot.quantityRemaining, 0);
  if (available < input.quantity) {
    return { error: `You only have ${available} of your units on hand.` as const };
  }

  let left = input.quantity;
  for (const lot of lots) {
    if (left <= 0) break;
    const take = Math.min(lot.quantityRemaining, left);
    await tx.stockLot.update({
      where: { id: lot.id },
      data: { quantityRemaining: lot.quantityRemaining - take },
    });
    left -= take;
  }

  const product = await tx.product.findUniqueOrThrow({
    where: { id: input.productId },
    select: { stockQuantity: true, name: true },
  });
  if (product.stockQuantity < input.quantity) {
    return { error: "Stock is lower than expected." as const };
  }
  const next = product.stockQuantity - input.quantity;
  await tx.product.update({
    where: { id: input.productId },
    data: { stockQuantity: next },
  });
  await tx.inventoryAdjustment.create({
    data: {
      productId: input.productId,
      ownerId: input.ownerId,
      standId: input.standId,
      memberId: input.memberId,
      changeQuantity: -input.quantity,
      previousQuantity: product.stockQuantity,
      newQuantity: next,
      reason: `${input.memberName} removed stock`,
      source: InventorySource.OWNER_MANUAL,
    },
  });
  return { ok: true as const, productName: product.name };
}
