"use server";

import { revalidatePath } from "next/cache";
import { CollectionStatus, PaymentStatus } from "@/generated/prisma/client";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
const NEXT: Record<CollectionStatus, CollectionStatus | null> = {
  ORDERED: CollectionStatus.READY,
  READY: CollectionStatus.COLLECTED,
  COLLECTED: null,
};

export async function advanceCollectionStatus(orderId: string) {
  const { owner } = await requireOwner();

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      ownerId: owner.id,
      isPreOrder: true,
      paymentStatus: PaymentStatus.PAID,
    },
  });
  if (!order || !order.collectionStatus) {
    return { error: "Order not found." };
  }

  const next = NEXT[order.collectionStatus];
  if (!next) return { error: "Already collected." };

  await prisma.order.update({
    where: { id: order.id },
    data: { collectionStatus: next },
  });

  revalidatePath("/dashboard/collections");
  return { ok: true as const };
}
