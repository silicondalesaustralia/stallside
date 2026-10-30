import { prisma } from "@/lib/prisma";

/** Products marked tax-free (fresh produce, exempt goods), first `shown` by name plus the total. */
export async function loadTaxFreeProducts(ownerId: string, shown: number) {
  const where = { ownerId, gstFree: true, isArchived: false };
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { name: "asc" },
      take: shown,
      select: { id: true, name: true, stand: { select: { name: true } } },
    }),
    prisma.product.count({ where }),
  ]);
  return { products, total };
}
