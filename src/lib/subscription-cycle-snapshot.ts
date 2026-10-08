import { PaymentTiming, type HandoverMode } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

/** Record how a subscription cycle order is handed over (best effort; never blocks the order). */
export async function snapshotSubscriptionCycleFulfilment(input: {
  orderId: string;
  standId: string;
  ownerId: string;
  offerId: string;
  collectionAt: Date;
  collectionNote: string | null;
  handoverMode: HandoverMode;
}): Promise<void> {
  try {
    const { snapshotFromLegacyPreOrder, snapshotOrderFulfilment } = await import(
      "@/lib/fulfilment/snapshot-order"
    );
    const offerOption = await prisma.fulfilmentOption.findFirst({
      where: { subscriptionOfferId: input.offerId },
      select: { id: true },
    });
    if (offerOption) {
      await snapshotOrderFulfilment({
        orderId: input.orderId,
        standId: input.standId,
        ownerId: input.ownerId,
        isPreOrder: true,
        collectionAt: input.collectionAt,
        collectionNote: input.collectionNote,
        handoverMode: input.handoverMode,
        collectionStatus: "ORDERED",
        fulfilmentOptionId: offerOption.id,
      });
    } else {
      await snapshotFromLegacyPreOrder({
        orderId: input.orderId,
        standId: input.standId,
        ownerId: input.ownerId,
        collectionAt: input.collectionAt,
        collectionNote: input.collectionNote,
        handoverMode: input.handoverMode,
        paymentTiming: PaymentTiming.PAY_UPFRONT,
      });
    }
  } catch (err) {
    console.error("Subscription fulfilment snapshot failed", err);
  }
}
