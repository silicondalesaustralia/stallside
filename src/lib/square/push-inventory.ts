import { prisma } from "@/lib/prisma";
import {
  CommerceProvider,
  InventorySource,
} from "@/generated/prisma/client";
import { getValidSquareAccessToken } from "@/lib/square/connection";
import { batchChangeSquareInventory } from "@/lib/square/inventory-api";

/**
 * After a Vendl-originated stock decrement, push adjustment to Square Inventory API
 * (not Orders API) so Stripe+Square mixed sellers avoid the 1% Orders fee.
 */
export async function pushVendlSaleToSquareInventory(input: {
  ownerId: string;
  orderId: string;
  items: Array<{ productId: string; quantity: number }>;
}): Promise<{ pushed: number; skipped: string }> {
  const conn = await prisma.externalCommerceConnection.findUnique({
    where: {
      ownerId_provider: {
        ownerId: input.ownerId,
        provider: CommerceProvider.SQUARE,
      },
    },
  });
  if (!conn?.inventorySyncEnabled || !conn.primaryLocationId) {
    return { pushed: 0, skipped: "sync_off" };
  }

  const token = await getValidSquareAccessToken(conn.id);
  if (!token) return { pushed: 0, skipped: "no_token" };

  const mappings = await prisma.externalVariantMapping.findMany({
    where: {
      connectionId: conn.id,
      productId: { in: input.items.map((i) => i.productId) },
      inventorySyncEnabled: true,
      confirmedAt: { not: null },
    },
  });
  if (mappings.length === 0) return { pushed: 0, skipped: "unmapped" };

  const byProduct = new Map(mappings.map((m) => [m.productId, m]));
  const changes = input.items
    .filter((i) => byProduct.has(i.productId))
    .map((i) => {
      const m = byProduct.get(i.productId)!;
      return {
        catalogObjectId: m.providerVariationId,
        locationId: conn.primaryLocationId!,
        quantity: String(i.quantity),
        fromState: "IN_STOCK" as const,
        toState: "SOLD" as const,
      };
    });

  if (changes.length === 0) return { pushed: 0, skipped: "unmapped" };

  const idempotencyKey = `vendl-order-${input.orderId}`;
  await batchChangeSquareInventory({
    accessToken: token,
    idempotencyKey,
    changes,
  });

  // Tag adjustments so Square webhook echoes are ignored.
  for (const item of input.items) {
    if (!byProduct.has(item.productId)) continue;
    await prisma.inventoryAdjustment.updateMany({
      where: {
        orderId: input.orderId,
        productId: item.productId,
        source: {
          in: [
            InventorySource.ORDER_CARD,
            InventorySource.ORDER_PAYPAL,
            InventorySource.ORDER_SQUARE,
          ],
        },
        externalReference: null,
      },
      data: { externalReference: idempotencyKey },
    });
  }

  return { pushed: changes.length, skipped: "ok" };
}
