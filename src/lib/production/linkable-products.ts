import { prisma } from "@/lib/prisma";

/** A business's own products that aren't made from a recipe yet. */
export function loadLinkableProducts(ownerId: string, standId: string) {
  return prisma.product.findMany({
    where: { ownerId, standId, isArchived: false, memberId: null, productRecipe: null },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}
