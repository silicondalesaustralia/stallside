import { prisma } from "@/lib/prisma";
import { productDashboardWhere } from "@/lib/product-visibility";

export type ProductListTab = "standard" | "preorder" | "draft" | "supplier";

function tabWhere(tab: ProductListTab) {
  if (tab === "supplier") return { memberId: { not: null } };
  if (tab === "draft") return { memberId: null, isHidden: false, isArchived: true };
  return {
    memberId: null,
    preOrderEligible: tab === "preorder",
    isHidden: false,
    ...productDashboardWhere,
  };
}

/** The dashboard Products list for one tab and optional name/SKU/UPC search. */
export function listStandProducts(opts: {
  ownerId: string;
  standId: string;
  tab: ProductListTab;
  q?: string;
}) {
  const q = opts.q?.trim();
  return prisma.product.findMany({
    where: {
      ownerId: opts.ownerId,
      standId: opts.standId,
      ...tabWhere(opts.tab),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" as const } },
              { sku: { contains: q, mode: "insensitive" as const } },
              { upc: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      imageUrl: true,
      isHidden: true,
      isArchived: true,
      priceCents: true,
      currency: true,
      costCents: true,
      stockQuantity: true,
      lowStockThreshold: true,
      supplyStatus: true,
      sku: true,
      member: { select: { name: true } },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export function findOwnerProduct(ownerId: string, productId: string) {
  return prisma.product.findFirst({
    where: { id: productId, ownerId },
    select: { id: true, standId: true },
  });
}

export type StandProductRow = Awaited<ReturnType<typeof listStandProducts>>[number];
