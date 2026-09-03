"use server";

import { revalidatePath } from "next/cache";
import { CollectionStatus, PaymentStatus } from "@/generated/prisma/client";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { orderFullyPaidForCollection } from "@/lib/deposit-order";
import { collectionToFulfilmentStatus } from "@/lib/ops/status";

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
    include: { fulfilment: { select: { id: true } } },
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

  if (
    order.paymentStatus !== PaymentStatus.PAID &&
    order.paymentStatus !== PaymentStatus.CUSTOMER_CONFIRMED
  ) {
    return { error: "Order is not fully paid." };
  }

  const next = NEXT[order.collectionStatus];
  if (!next) return { error: "Already collected." };

  const fulfilmentStatus = collectionToFulfilmentStatus(next);

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: { collectionStatus: next },
    });
    if (order.fulfilment) {
      await tx.orderFulfilment.update({
        where: { id: order.fulfilment.id },
        data: { fulfilmentStatus },
      });
    } else {
      await tx.orderFulfilment.create({
        data: {
          orderId: order.id,
          kind: "STAND_IMMEDIATE",
          optionLabel: "Order",
          handoverMode: order.handoverMode,
          fulfilmentStatus,
        },
      });
    }
  });

  revalidatePath("/dashboard/collections");
  revalidatePath("/dashboard/fulfilment/orders");
  return { ok: true as const };
}
