import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { CommerceProvider } from "@/generated/prisma/client";
import { getValidSquareAccessToken } from "@/lib/square/connection";
import { setSquarePhysicalCounts } from "@/lib/square/inventory-api";
import { pushVendlSaleToSquareInventory } from "@/lib/square/push-inventory";

/** Overwrite Square's count with Vendl's for linked products (manual edits, stock counts). */
export async function setSquareStockFromVendl(input: {
  ownerId: string;
  productIds: string[];
}): Promise<number> {
  if (input.productIds.length === 0) return 0;
  const conn = await prisma.externalCommerceConnection.findUnique({
    where: {
      ownerId_provider: { ownerId: input.ownerId, provider: CommerceProvider.SQUARE },
    },
  });
  if (!conn?.inventorySyncEnabled || conn.status !== "ACTIVE" || !conn.primaryLocationId) {
    return 0;
  }
  const mappings = await prisma.externalVariantMapping.findMany({
    where: {
      connectionId: conn.id,
      productId: { in: input.productIds },
      inventorySyncEnabled: true,
      confirmedAt: { not: null },
    },
    include: { product: { select: { stockQuantity: true } } },
  });
  if (mappings.length === 0) return 0;
  const token = await getValidSquareAccessToken(conn.id);
  if (!token) return 0;

  await setSquarePhysicalCounts({
    accessToken: token,
    idempotencyKey: `vendl-count-${randomUUID()}`,
    counts: mappings.map((m) => ({
      catalogObjectId: m.providerVariationId,
      locationId: conn.primaryLocationId as string,
      quantity: m.product.stockQuantity,
    })),
  });
  return mappings.length;
}

/** Best-effort: never fail the caller's stock change because Square is unreachable. */
export async function syncManualStockToSquare(ownerId: string, productIds: string[]) {
  try {
    await setSquareStockFromVendl({ ownerId, productIds });
  } catch (error) {
    console.error("Square stock sync after manual change failed", error);
  }
}

/** Best-effort sale push for non-card orders (cash, PayID). */
export async function syncSaleToSquare(input: {
  ownerId: string;
  orderId: string;
  items: Array<{ productId: string; quantity: number }>;
}) {
  try {
    await pushVendlSaleToSquareInventory(input);
  } catch (error) {
    console.error("Square stock sync after sale failed", error);
  }
}
