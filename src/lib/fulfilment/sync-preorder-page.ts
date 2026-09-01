import { prisma } from "@/lib/prisma";
import {
  FulfilmentOptionKind,
  HandoverMode,
  PaymentTiming,
  PickupWindowRecurrence,
} from "@/generated/prisma/client";

/** Upsert FulfilmentOption + PickupWindow from PreOrderPage schedule (dual-write). */
export async function syncPreOrderPageFulfilmentOption(preOrderPageId: string) {
  const page = await prisma.preOrderPage.findUnique({
    where: { id: preOrderPageId },
    include: { stand: { select: { timezone: true } } },
  });
  if (!page) return null;

  const existing = await prisma.fulfilmentOption.findFirst({
    where: { preOrderPageId: page.id },
    include: { pickupWindow: true },
  });

  const windowData = {
    ownerId: page.ownerId,
    label: page.title,
    timezone: page.stand.timezone,
    recurrence: PickupWindowRecurrence.ONE_OFF,
    startsAt: page.collectionAt,
    endsAt: page.collectionAt,
    orderOpensAt: null as Date | null,
    orderClosesAt: page.orderByAt,
    isActive: page.isActive,
  };

  let windowId = existing?.pickupWindowId ?? null;
  if (windowId) {
    await prisma.pickupWindow.update({
      where: { id: windowId },
      data: windowData,
    });
  } else {
    const win = await prisma.pickupWindow.create({ data: windowData });
    windowId = win.id;
  }

  const optionData = {
    ownerId: page.ownerId,
    kind: FulfilmentOptionKind.PREORDER_SHEET,
    label: page.title,
    standId: page.standId,
    pickupWindowId: windowId,
    preOrderPageId: page.id,
    handoverMode: page.handoverMode,
    paymentTiming: page.paymentTiming,
    depositPercent: page.depositPercent,
    channels: ["STAND"],
    isActive: page.isActive,
  };

  if (existing) {
    return prisma.fulfilmentOption.update({
      where: { id: existing.id },
      data: optionData,
    });
  }

  return prisma.fulfilmentOption.create({ data: optionData });
}
