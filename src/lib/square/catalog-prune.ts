import { prisma } from "@/lib/prisma";
import { listSquareCatalogItems } from "@/lib/square/catalog";
import { getValidSquareAccessToken } from "@/lib/square/connection";

/** Square's catalogue list can lag just-created items; leave fresh links alone. */
const RECENT_LINK_GRACE_MS = 2 * 60_000;

/**
 * Drop Vendl ↔ Square links whose Square item or variation was deleted in Square,
 * so those products can be pushed again. Returns how many products were unlinked.
 */
export async function pruneDeletedSquareLinks(connectionId: string): Promise<number> {
  const token = await getValidSquareAccessToken(connectionId);
  if (!token) return 0;

  const items = await listSquareCatalogItems(token);
  const itemIds = new Set<string>();
  const variationIds = new Set<string>();
  for (const item of items) {
    if (item.id) itemIds.add(item.id);
    for (const v of item.item_data?.variations ?? []) {
      if (v.id) variationIds.add(v.id);
    }
  }

  const settled = { lt: new Date(Date.now() - RECENT_LINK_GRACE_MS) };
  const [variantLinks, productLinks] = await Promise.all([
    prisma.externalVariantMapping.findMany({
      where: { connectionId, createdAt: settled },
      select: { productId: true, providerVariationId: true },
    }),
    prisma.externalProductMapping.findMany({
      where: { connectionId, createdAt: settled },
      select: { productId: true, providerProductId: true },
    }),
  ]);

  const stale = new Set<string>([
    ...variantLinks
      .filter((m) => !variationIds.has(m.providerVariationId))
      .map((m) => m.productId),
    ...productLinks
      .filter((m) => !itemIds.has(m.providerProductId))
      .map((m) => m.productId),
  ]);
  if (stale.size === 0) return 0;

  const productId = { in: [...stale] };
  await prisma.$transaction([
    prisma.externalVariantMapping.deleteMany({ where: { connectionId, productId } }),
    prisma.externalProductMapping.deleteMany({ where: { connectionId, productId } }),
  ]);
  return stale.size;
}
