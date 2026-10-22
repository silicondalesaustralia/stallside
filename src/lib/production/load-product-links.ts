import { prisma } from "@/lib/prisma";

export type ProductLink = {
  productId: string;
  recipeId: string;
  yieldUnitsPerProduct: number;
  productName: string;
  priceCents: number;
  currency: string;
  packagingCostCents: number | null;
  costCents: number | null;
  stockQuantity: number;
  standId: string;
};

/** Product ↔ recipe links for an owner, optionally limited to one recipe. */
export async function loadProductLinks(ownerId: string, recipeId?: string): Promise<ProductLink[]> {
  const links = await prisma.productRecipe.findMany({
    where: { product: { ownerId }, ...(recipeId ? { recipeId } : {}) },
    include: {
      product: {
        select: {
          name: true,
          priceCents: true,
          currency: true,
          packagingCostCents: true,
          costCents: true,
          stockQuantity: true,
          standId: true,
        },
      },
    },
    orderBy: { product: { name: "asc" } },
  });
  return links.map((l) => ({
    productId: l.productId,
    recipeId: l.recipeId,
    yieldUnitsPerProduct: Number(l.yieldUnitsPerProduct),
    productName: l.product.name,
    priceCents: l.product.priceCents,
    currency: l.product.currency,
    packagingCostCents: l.product.packagingCostCents,
    costCents: l.product.costCents,
    stockQuantity: l.product.stockQuantity,
    standId: l.product.standId,
  }));
}
