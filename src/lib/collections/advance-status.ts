import { revalidatePath } from "next/cache";
import { CollectionStatus, PaymentStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { orderFullyPaidForCollection } from "@/lib/deposit-order";
import { awaitingPickupPayment } from "@/lib/pay-at-pickup";

const NEXT: Partial<Record<CollectionStatus, CollectionStatus | null>> = {
  ORDERED: CollectionStatus.READY,
  READY: CollectionStatus.COLLECTED,
  COLLECTED: null,
};

/** Ordered → Ready → Collected, only once the order is fully paid. */
export async function advanceOwnerCollection(
  ownerId: string,
  orderId: string,
): Promise<{ ok: true; status: CollectionStatus } | { error: string }> {
  const order = await prisma.order.findFirst({
    where: { id: orderId, ownerId, isPreOrder: true },
    select: { id: true, collectionStatus: true, paymentStatus: true, paymentTiming: true },
  });
  if (!order || !order.collectionStatus) return { error: "Order not found." };

  if (!orderFullyPaidForCollection(order.paymentStatus)) {
    return { error: "Balance must clear before this order can be marked ready or collected." };
  }

  const next = NEXT[order.collectionStatus];
  if (!next) return { error: "Already collected." };

  const paidOnCollect = next === CollectionStatus.COLLECTED && awaitingPickupPayment(order);
  await prisma.order.update({
    where: { id: order.id },
    data: {
      collectionStatus: next,
      ...(paidOnCollect ? { paymentStatus: PaymentStatus.PAID } : {}),
    },
  });
  if (paidOnCollect) revalidatePath("/dashboard/orders", "layout");
  revalidatePath("/dashboard/collections", "layout");
  return { ok: true, status: next };
}
