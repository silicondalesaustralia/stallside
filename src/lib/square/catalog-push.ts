import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getSquareConnection, getValidSquareAccessToken } from "@/lib/square/connection";
import { createSquareItems } from "@/lib/square/catalog-upsert";
import { setSquarePhysicalCounts } from "@/lib/square/inventory-api";
import { SQUARE_CURRENCY } from "@/lib/commerce/payment-rail";

const CHUNK = 25;

function unlinkedWhere(ownerId: string, connectionId: string) {
  return {
    ownerId,
    isArchived: false,
    membershipFulfilmentOffers: { none: {} },
    externalVariantMappings: { none: { connectionId } },
  };
}

const squareCurrency = { equals: SQUARE_CURRENCY, mode: "insensitive" as const };

/** Unlinked products Square can't hold because they're priced in another currency. */
export async function countUnlinkedOtherCurrency(ownerId: string, connectionId: string) {
  return prisma.product.count({
    where: { ...unlinkedWhere(ownerId, connectionId), NOT: { currency: squareCurrency } },
  });
}

/** AUD products not yet linked to a Square item (excludes hidden membership targets). */
export async function listUnlinkedProducts(ownerId: string, connectionId: string) {
  return prisma.product.findMany({
    where: { ...unlinkedWhere(ownerId, connectionId), currency: squareCurrency },
    select: {
      id: true,
      name: true,
      priceCents: true,
      stockQuantity: true,
      stand: { select: { name: true } },
    },
    orderBy: [{ stand: { name: "asc" } }, { sortOrder: "asc" }, { name: "asc" }],
  });
}

export type PushResult =
  | { ok: true; created: number; stockSet: number; failed: number }
  | { error: string };

export async function pushProductsToSquare(input: {
  ownerId: string;
  productIds: string[];
}): Promise<PushResult> {
  const conn = await getSquareConnection(input.ownerId);
  if (!conn || conn.status !== "ACTIVE") return { error: "Connect Square first." };
  if (!conn.catalogSyncEnabled) return { error: "Turn on product / catalogue sync first." };
  const token = await getValidSquareAccessToken(conn.id);
  if (!token) return { error: "Reconnect Square, then try again." };

  const unlinked = await listUnlinkedProducts(input.ownerId, conn.id);
  const wanted = new Set(input.productIds);
  const ids = unlinked.filter((p) => wanted.has(p.id)).map((p) => p.id);
  if (ids.length === 0) return { error: "Those products are already in Square." };

  const products = await prisma.product.findMany({
    where: { id: { in: ids }, ownerId: input.ownerId },
    select: {
      id: true,
      name: true,
      description: true,
      priceCents: true,
      currency: true,
      sku: true,
      upc: true,
      stockQuantity: true,
    },
  });

  let created = 0;
  let stockSet = 0;
  const batchKey = randomUUID();
  for (let i = 0; i < products.length; i += CHUNK) {
    const chunk = products.slice(i, i + CHUNK);
    const items = await createSquareItems({
      accessToken: token,
      idempotencyKey: `${batchKey}:${i}`,
      products: chunk,
    });
    const now = new Date();
    for (const item of items) {
      await prisma.$transaction([
        prisma.externalProductMapping.create({
          data: {
            connectionId: conn.id,
            productId: item.productId,
            providerProductId: item.itemId,
            confirmedAt: now,
          },
        }),
        prisma.externalVariantMapping.create({
          data: {
            connectionId: conn.id,
            productId: item.productId,
            providerVariationId: item.variationId,
            providerSku: item.sku,
            confirmedAt: now,
            lastSyncedAt: now,
          },
        }),
      ]);
    }
    created += items.length;

    if (conn.inventorySyncEnabled && conn.primaryLocationId && items.length) {
      const stock = new Map(chunk.map((p) => [p.id, p.stockQuantity]));
      await setSquarePhysicalCounts({
        accessToken: token,
        idempotencyKey: `${batchKey}:stock:${i}`,
        counts: items.map((item) => ({
          catalogObjectId: item.variationId,
          locationId: conn.primaryLocationId as string,
          quantity: stock.get(item.productId) ?? 0,
        })),
      });
      stockSet += items.length;
    }
  }

  return { ok: true, created, stockSet, failed: products.length - created };
}
