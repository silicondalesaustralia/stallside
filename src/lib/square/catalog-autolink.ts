import { prisma } from "@/lib/prisma";
import { listSquareCatalogItems, suggestCatalogMatches } from "@/lib/square/catalog";

/**
 * Link chosen Vendl products to Square items that already match them exactly
 * (SKU, barcode or name), so pushing doesn't create duplicates in Square.
 * Returns the product ids that were linked.
 */
export async function linkExistingSquareItems(input: {
  connectionId: string;
  accessToken: string;
  ownerId: string;
  productIds: string[];
}): Promise<Set<string>> {
  const linked = new Set<string>();
  if (input.productIds.length === 0) return linked;

  const [items, products, mappings, productMappings] = await Promise.all([
    listSquareCatalogItems(input.accessToken),
    prisma.product.findMany({
      where: { id: { in: input.productIds }, ownerId: input.ownerId },
      select: { id: true, name: true, sku: true, upc: true },
    }),
    prisma.externalVariantMapping.findMany({
      where: { connectionId: input.connectionId },
      select: { providerVariationId: true },
    }),
    prisma.externalProductMapping.findMany({
      where: { connectionId: input.connectionId },
      select: { providerProductId: true },
    }),
  ]);

  const takenItems = new Set(productMappings.map((m) => m.providerProductId));
  const takenVariations = new Set(mappings.map((m) => m.providerVariationId));
  const skuByVariation = new Map<string, string | null>();
  for (const item of items) {
    for (const v of item.item_data?.variations ?? []) {
      if (v.id) skuByVariation.set(v.id, v.item_variation_data?.sku?.trim() || null);
    }
  }

  const now = new Date();
  for (const match of suggestCatalogMatches(products, items)) {
    if (
      linked.has(match.productId) ||
      takenItems.has(match.providerProductId) ||
      takenVariations.has(match.providerVariationId)
    ) {
      continue;
    }
    await prisma.$transaction([
      prisma.externalProductMapping.create({
        data: {
          connectionId: input.connectionId,
          productId: match.productId,
          providerProductId: match.providerProductId,
          confirmedAt: now,
        },
      }),
      prisma.externalVariantMapping.create({
        data: {
          connectionId: input.connectionId,
          productId: match.productId,
          providerVariationId: match.providerVariationId,
          providerSku: skuByVariation.get(match.providerVariationId) ?? null,
          confirmedAt: now,
          lastSyncedAt: now,
        },
      }),
    ]);
    linked.add(match.productId);
    takenItems.add(match.providerProductId);
    takenVariations.add(match.providerVariationId);
  }
  return linked;
}
