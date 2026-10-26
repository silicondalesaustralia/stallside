import { prisma } from "@/lib/prisma";

/** Newer / older order in the same business, for the order page's up/down arrows. */
export async function orderNeighbours(order: { id: string; standId: string; createdAt: Date }) {
  const select = { id: true } as const;
  const [newer, older] = await Promise.all([
    prisma.order.findFirst({
      where: { standId: order.standId, createdAt: { gt: order.createdAt } },
      orderBy: { createdAt: "asc" },
      select,
    }),
    prisma.order.findFirst({
      where: { standId: order.standId, createdAt: { lt: order.createdAt } },
      orderBy: { createdAt: "desc" },
      select,
    }),
  ]);
  return { newerId: newer?.id ?? null, olderId: older?.id ?? null };
}
