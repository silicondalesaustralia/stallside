"use server";

import { revalidatePath } from "next/cache";
import { CollectionStatus, PaymentStatus } from "@/generated/prisma/client";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { orderFullyPaidForCollection } from "@/lib/deposit-order";
import { awaitingPickupPayment } from "@/lib/pay-at-pickup";

const NEXT: Partial<Record<CollectionStatus, CollectionStatus | null>> = {
  ORDERED: CollectionStatus.READY,
  READY: CollectionStatus.COLLECTED,
  COLLECTED: null,
};

export async function advanceCollectionStatus(orderId: string) {
  const { owner } = await requireOwnerWrite();

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      ownerId: owner.id,
      isPreOrder: true,
    },
  });
  if (!order || !order.collectionStatus) {
    return { error: "Order not found." };
  }

  if (!orderFullyPaidForCollection(order.paymentStatus)) {
    return {
      error:
        "Balance must clear before this order can be marked ready or collected.",
    };
  }

  // Only advance packing after full payment (PAID).
  if (order.paymentStatus !== PaymentStatus.PAID && order.paymentStatus !== PaymentStatus.CUSTOMER_CONFIRMED) {
    return { error: "Order is not fully paid." };
  }

  const next = NEXT[order.collectionStatus];
  if (!next) return { error: "Already collected." };

  const paidOnCollect =
    next === CollectionStatus.COLLECTED && awaitingPickupPayment(order);
  await prisma.order.update({
    where: { id: order.id },
    data: {
      collectionStatus: next,
      ...(paidOnCollect ? { paymentStatus: PaymentStatus.PAID } : {}),
    },
  });

  revalidatePath("/dashboard/collections");
  if (paidOnCollect) revalidatePath("/dashboard/orders");
  return { ok: true as const };
}
