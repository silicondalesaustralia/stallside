import { prisma } from "@/lib/prisma";
import {
  FulfilmentOptionKind,
  HandoverMode,
  PaymentTiming,
  PickupWindowRecurrence,
} from "@/generated/prisma/client";

/** Upsert FulfilmentOption from SubscriptionOffer schedule (dual-write). */
export async function syncSubscriptionOfferFulfilmentOption(offerId: string) {
  const offer = await prisma.subscriptionOffer.findUnique({
    where: { id: offerId },
    include: { stand: { select: { timezone: true } } },
  });
  if (!offer) return null;

  const existing = await prisma.fulfilmentOption.findFirst({
    where: { subscriptionOfferId: offer.id },
    include: { pickupWindow: true },
  });

  const windowData = {
    ownerId: offer.ownerId,
    label: offer.title,
    timezone: offer.stand.timezone,
    recurrence: PickupWindowRecurrence.WEEKLY,
    weekday: offer.collectionWeekday,
    isActive: offer.isActive,
  };

  let windowId = existing?.pickupWindowId ?? null;
  if (offer.handoverMode === HandoverMode.COLLECT && offer.collectionWeekday != null) {
    if (windowId) {
      await prisma.pickupWindow.update({
        where: { id: windowId },
        data: windowData,
      });
    } else {
      const win = await prisma.pickupWindow.create({ data: windowData });
      windowId = win.id;
    }
  } else if (windowId) {
    await prisma.pickupWindow.delete({ where: { id: windowId } }).catch(() => undefined);
    windowId = null;
  }

  const optionData = {
    ownerId: offer.ownerId,
    kind: FulfilmentOptionKind.SUBSCRIPTION,
    label: offer.title,
    standId: offer.standId,
    pickupWindowId: windowId,
    subscriptionOfferId: offer.id,
    handoverMode: offer.handoverMode,
    paymentTiming: PaymentTiming.PAY_UPFRONT,
    channels: ["STAND"],
    isActive: offer.isActive,
  };

  if (existing) {
    return prisma.fulfilmentOption.update({
      where: { id: existing.id },
      data: optionData,
    });
  }

  return prisma.fulfilmentOption.create({ data: optionData });
}
