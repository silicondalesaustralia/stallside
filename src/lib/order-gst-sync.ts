import { prisma } from "@/lib/prisma";
import { gstApplies, lineGstCents } from "@/lib/gst";

/**
 * Recompute GST on an owner's past orders from their current GST registration
 * and each product's current GST-free flag.
 */
export async function syncOwnerOrderGst(
  ownerId: string,
  opts: { onlyMissing?: boolean; dryRun?: boolean } = {},
): Promise<{ checked: number; updated: number }> {
  const owner = await prisma.owner.findUnique({
    where: { id: ownerId },
    select: { gstRegistered: true },
  });
  if (!owner) return { checked: 0, updated: 0 };

  const orders = await prisma.order.findMany({
    where: { ownerId, ...(opts.onlyMissing ? { gstCents: 0 } : {}) },
    include: { items: { include: { product: { select: { gstFree: true } } } } },
  });

  let updated = 0;
  for (const order of orders) {
    const lines = order.items.map((i) => ({
      lineTotalCents: i.lineTotalCents,
      gstFree: i.product.gstFree,
    }));
    const gst = lineGstCents(
      lines,
      order.discountCents,
      gstApplies(owner, order.currency),
    );
    const total = gst.reduce((sum, cents) => sum + cents, 0);
    const changed =
      total !== order.gstCents ||
      order.items.some(
        (item, i) => item.gstCents !== gst[i] || item.gstFree !== lines[i].gstFree,
      );
    if (!changed) continue;
    updated += 1;
    if (opts.dryRun) continue;
    await prisma.$transaction([
      ...order.items.map((item, i) =>
        prisma.orderItem.update({
          where: { id: item.id },
          data: { gstFree: lines[i].gstFree, gstCents: gst[i] },
        }),
      ),
      prisma.order.update({ where: { id: order.id }, data: { gstCents: total } }),
    ]);
  }
  return { checked: orders.length, updated };
}
