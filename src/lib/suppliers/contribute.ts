import type { Prisma } from "@/generated/prisma/client";
import { InventorySource } from "@/generated/prisma/client";

type Tx = Prisma.TransactionClient;

/** Add a supplier contribution lot; bumps product stock when ACTIVE. */
export async function createContributionLot(
  tx: Tx,
  input: {
    productId: string;
    ownerId: string;
    standId: string;
    memberId: string;
    memberName: string;
    supplierUnitCents: number;
    quantity: number;
    status: "PENDING" | "ACTIVE";
    reason?: string;
  },
) {
  const product = await tx.product.findUniqueOrThrow({
    where: { id: input.productId },
    select: { stockQuantity: true, name: true },
  });

  const lot = await tx.stockLot.create({
    data: {
      productId: input.productId,
      memberId: input.memberId,
      supplierUnitCents: input.supplierUnitCents,
      quantityRemaining: input.quantity,
      status: input.status,
    },
  });

  if (input.status !== "ACTIVE") {
    return { lot, productName: product.name, previous: product.stockQuantity };
  }

  const next = product.stockQuantity + input.quantity;
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
      changeQuantity: input.quantity,
      previousQuantity: product.stockQuantity,
      newQuantity: next,
      reason: input.reason ?? `${input.memberName} added stock`,
      source: InventorySource.OWNER_MANUAL,
    },
  });

  return { lot, productName: product.name, previous: product.stockQuantity };
}

/** Approve a PENDING lot: activate and add to on-hand stock. */
export async function activatePendingLot(
  tx: Tx,
  input: {
    lotId: string;
    ownerId: string;
    standId: string;
    memberName: string;
  },
) {
  const lot = await tx.stockLot.findFirst({
    where: { id: input.lotId, status: "PENDING" },
    include: { product: { select: { id: true, stockQuantity: true, name: true } } },
  });
  if (!lot || !lot.memberId) return null;

  const previous = lot.product.stockQuantity;
  const next = previous + lot.quantityRemaining;
  await tx.stockLot.update({
    where: { id: lot.id },
    data: { status: "ACTIVE" },
  });
  await tx.product.update({
    where: { id: lot.productId },
    data: { stockQuantity: next },
  });
  await tx.inventoryAdjustment.create({
    data: {
      productId: lot.productId,
      ownerId: input.ownerId,
      standId: input.standId,
      memberId: lot.memberId,
      changeQuantity: lot.quantityRemaining,
      previousQuantity: previous,
      newQuantity: next,
      reason: `${input.memberName} stock approved`,
      source: InventorySource.OWNER_MANUAL,
    },
  });
  return { productId: lot.productId, productName: lot.product.name, quantity: lot.quantityRemaining };
}
