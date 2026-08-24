"use server";

import { revalidatePath } from "next/cache";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@/generated/prisma/client";
import { COUNTED_STATUSES } from "@/lib/order-metrics";

const RESTORE_STATUSES = COUNTED_STATUSES as PaymentStatus[];

export async function deleteOrder(orderId: string) {
  const { owner } = await requireOwnerWrite();
  const id = orderId.trim();
  if (!id) return { error: "Order not found." };

  const order = await prisma.order.findFirst({
    where: { id, ownerId: owner.id },
    include: { items: true },
  });
  if (!order) return { error: "Order not found." };

  const shouldRestore = RESTORE_STATUSES.includes(order.paymentStatus);

  await prisma.$transaction(async (tx) => {
    if (shouldRestore) {
      for (const item of order.items) {
        await tx.product.updateMany({
          where: { id: item.productId },
          data: { stockQuantity: { increment: item.quantity } },
        });
      }
    }

    await tx.inventoryAdjustment.deleteMany({ where: { orderId: order.id } });
    await tx.orderItem.deleteMany({ where: { orderId: order.id } });
    await tx.order.delete({ where: { id: order.id } });
  });

  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard");
  return { ok: true as const };
}
