import { prisma } from "@/lib/prisma";
import { InventorySource } from "@/generated/prisma/client";
import { syncProductFromVariants } from "@/lib/product-variants/sync-product-total";
import type { ImportStock } from "../import-product";

const sameValues = (a: (string | null)[], b: string[]) =>
  b.every((v, i) => (a[i] ?? "").trim().toLowerCase() === v.toLowerCase());

/** Sets stock for one row, matched by SKU (variant, then product) or by name + option values. */
export async function applyImportStock(
  ownerId: string,
  standId: string,
  item: ImportStock,
): Promise<"updated" | "skipped" | { error: string }> {
  const live = { standId, ownerId, isArchived: false };
  let variant = item.sku
    ? await prisma.productVariant.findFirst({ where: { sku: item.sku, product: live } })
    : null;
  let product = !variant && item.sku
    ? await prisma.product.findFirst({ where: { ...live, sku: item.sku, variants: { none: {} } } })
    : null;
  if (!variant && !product && item.name) {
    const named = await prisma.product.findFirst({
      where: { ...live, name: { equals: item.name, mode: "insensitive" } },
      include: { variants: true },
    });
    if (named && named.variants.length && item.values.length) {
      variant =
        named.variants.find((v) => sameValues([v.option1, v.option2, v.option3], item.values)) ?? null;
    } else if (named && named.variants.length === 0) {
      product = named;
    }
  }

  if (variant) {
    if (variant.stockQuantity === item.stock) return "skipped";
    const productId = variant.productId;
    await prisma.$transaction(async (tx) => {
      await tx.productVariant.update({ where: { id: variant.id }, data: { stockQuantity: item.stock } });
      await syncProductFromVariants(tx, productId);
    });
    return "updated";
  }
  if (!product) return { error: "No matching product or variant." };
  if (product.stockQuantity === item.stock) return "skipped";
  await prisma.$transaction([
    prisma.product.update({ where: { id: product.id }, data: { stockQuantity: item.stock } }),
    prisma.inventoryAdjustment.create({
      data: {
        productId: product.id,
        ownerId,
        standId,
        changeQuantity: item.stock - product.stockQuantity,
        previousQuantity: product.stockQuantity,
        newQuantity: item.stock,
        reason: "Stock import",
        source: InventorySource.RECONCILIATION,
      },
    }),
  ]);
  return "updated";
}
