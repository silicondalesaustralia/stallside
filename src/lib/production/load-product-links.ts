import { prisma } from "@/lib/prisma";
import { packagingUnitCents, type PackagingLine } from "./packaging";

export type ProductLink = {
  productId: string;
  recipeId: string;
  yieldUnitsPerProduct: number;
  productName: string;
  priceCents: number;
  currency: string;
  /** Flat "other packaging" amount per unit. */
  packagingCostCents: number | null;
  packagingLines: (PackagingLine & { name: string })[];
  /** Listed packaging materials at today's prices plus the other amount. */
  packagingUnitCents: number;
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
          packagingLines: { orderBy: { sortOrder: "asc" }, include: { ingredient: true } },
        },
      },
    },
    orderBy: { product: { name: "asc" } },
  });
  return links.map((l) => {
    const packagingLines = l.product.packagingLines.map((p) => ({
      id: p.id,
      ingredientId: p.ingredientId,
      quantity: Number(p.quantity),
      unit: p.unit,
      name: p.ingredient.name,
    }));
    const materials = new Map(
      l.product.packagingLines.map((p) => [
        p.ingredientId,
        {
          id: p.ingredientId,
          name: p.ingredient.name,
          baseUnit: p.ingredient.baseUnit,
          purchaseQuantity: Number(p.ingredient.purchaseQuantity),
          purchaseUnit: p.ingredient.purchaseUnit,
          purchasePriceCents: p.ingredient.purchasePriceCents,
        },
      ]),
    );
    return productLinkRow(l, packagingLines, packagingUnitCents(packagingLines, materials, l.product.packagingCostCents));
  });
}

function productLinkRow(
  l: {
    productId: string;
    recipeId: string;
    yieldUnitsPerProduct: { toString(): string };
    product: {
      name: string;
      priceCents: number;
      currency: string;
      packagingCostCents: number | null;
      costCents: number | null;
      stockQuantity: number;
      standId: string;
    };
  },
  packagingLines: ProductLink["packagingLines"],
  packagingUnit: number,
): ProductLink {
  return {
    productId: l.productId,
    recipeId: l.recipeId,
    yieldUnitsPerProduct: Number(l.yieldUnitsPerProduct),
    productName: l.product.name,
    priceCents: l.product.priceCents,
    currency: l.product.currency,
    packagingCostCents: l.product.packagingCostCents,
    packagingLines,
    packagingUnitCents: packagingUnit,
    costCents: l.product.costCents,
    stockQuantity: l.product.stockQuantity,
    standId: l.product.standId,
  };
}
