import { prisma } from "@/lib/prisma";
import {
  CommerceProvider,
  InventorySource,
} from "@/generated/prisma/client";

/**
 * Apply Square canonical stock to a mapped Vendl product.
 * Idempotent on Square event id. Skips echo of our own adjustments.
 */
export async function applySquareInventoryCount(input: {
  merchantId: string;
  eventId: string;
  catalogObjectId: string;
  locationId: string;
  quantity: number;
  causedByReference?: string | null;
}): Promise<"applied" | "duplicate" | "echo" | "unmapped" | "location"> {
  const existing = await prisma.inventoryAdjustment.findUnique({
    where: { externalEventId: input.eventId },
  });
  if (existing) return "duplicate";

  if (input.causedByReference) {
    const ours = await prisma.inventoryAdjustment.findFirst({
      where: { externalReference: input.causedByReference },
    });
    if (ours) return "echo";
  }

  const conn = await prisma.externalCommerceConnection.findFirst({
    where: {
      provider: CommerceProvider.SQUARE,
      providerMerchantId: input.merchantId,
      inventorySyncEnabled: true,
      status: "ACTIVE",
    },
  });
  if (!conn) return "unmapped";

  if (
    conn.primaryLocationId &&
    conn.primaryLocationId !== input.locationId
  ) {
    const loc = await prisma.externalLocationMapping.findUnique({
      where: {
        connectionId_providerLocationId: {
          connectionId: conn.id,
          providerLocationId: input.locationId,
        },
      },
    });
    if (!loc) return "location";
  }

  const mapping = await prisma.externalVariantMapping.findUnique({
    where: {
      connectionId_providerVariationId: {
        connectionId: conn.id,
        providerVariationId: input.catalogObjectId,
      },
    },
    include: { product: true },
  });
  if (!mapping?.inventorySyncEnabled || !mapping.confirmedAt) {
    return "unmapped";
  }

  const product = mapping.product;
  const next = Math.max(0, Math.floor(input.quantity));
  if (product.stockQuantity === next) {
    await prisma.inventoryAdjustment.create({
      data: {
        productId: product.id,
        ownerId: product.ownerId,
        standId: product.standId,
        changeQuantity: 0,
        previousQuantity: product.stockQuantity,
        newQuantity: next,
        reason: "Square inventory count (no change)",
        source: InventorySource.EXTERNAL_SYNC,
        externalEventId: input.eventId,
      },
    });
    return "applied";
  }

  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id: product.id },
      data: { stockQuantity: next },
    });
    await tx.inventoryAdjustment.create({
      data: {
        productId: product.id,
        ownerId: product.ownerId,
        standId: product.standId,
        changeQuantity: next - product.stockQuantity,
        previousQuantity: product.stockQuantity,
        newQuantity: next,
        reason: "Square inventory sync",
        source: InventorySource.EXTERNAL_SYNC,
        externalEventId: input.eventId,
      },
    });
    await tx.externalVariantMapping.update({
      where: { id: mapping.id },
      data: { lastSyncedAt: new Date() },
    });
    await tx.externalCommerceConnection.update({
      where: { id: conn.id },
      data: { lastSyncAt: new Date() },
    });
  });

  return "applied";
}
