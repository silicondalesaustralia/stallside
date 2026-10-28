import { prisma } from "@/lib/prisma";
import type { ImportProduct } from "../import-product";

export type MatchedProduct = {
  id: string;
  imageUrl: string | null;
  isPreOrder: boolean;
  stockQuantity: number;
  _count: { variants: number; stockLots: number };
};

const select = {
  id: true,
  imageUrl: true,
  isPreOrder: true,
  stockQuantity: true,
  _count: { select: { variants: true, stockLots: true } },
} as const;

/** Existing product for an import row: by any SKU first, then by exact name. */
export async function matchImportProduct(
  standId: string,
  item: ImportProduct,
): Promise<MatchedProduct | null> {
  const skus = [item.sku, ...item.variants.map((v) => v.sku)].filter(
    (s): s is string => Boolean(s),
  );
  const live = { standId, isArchived: false };
  if (skus.length) {
    const viaVariant = await prisma.productVariant.findFirst({
      where: { sku: { in: skus }, product: live },
      select: { product: { select } },
    });
    if (viaVariant) return viaVariant.product;
    const viaProduct = await prisma.product.findFirst({
      where: { ...live, sku: { in: skus } },
      select,
    });
    if (viaProduct) return viaProduct;
  }
  return prisma.product.findFirst({
    where: { ...live, name: { equals: item.name, mode: "insensitive" } },
    select,
  });
}
