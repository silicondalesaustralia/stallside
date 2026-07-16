"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";

/** Permanently remove a stand and its products / orders for this owner. */
export async function deleteStand(standId: string) {
  const { owner } = await requireOwner();
  const existing = await prisma.stand.findFirst({
    where: { id: standId, ownerId: owner.id },
  });
  if (!existing) return { error: "Stand not found." };

  await prisma.$transaction(async (tx) => {
    const orders = await tx.order.findMany({
      where: { standId, ownerId: owner.id },
      select: { id: true },
    });
    const orderIds = orders.map((o) => o.id);
    if (orderIds.length > 0) {
      await tx.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
    }
    await tx.inventoryAdjustment.deleteMany({ where: { standId } });
    await tx.lowStockAlert.deleteMany({ where: { standId } });
    await tx.order.deleteMany({ where: { standId, ownerId: owner.id } });
    await tx.product.deleteMany({ where: { standId, ownerId: owner.id } });
    await tx.stand.delete({ where: { id: standId } });
  });

  revalidatePath("/dashboard/stands");
  redirect("/dashboard/stands");
}
