import { HandoverMode } from "@/generated/prisma/client";
import type { PreOrderCartMeta } from "@/lib/checkout";
import { findScheduledFulfilmentOption } from "@/lib/fulfilment/resolve-checkout";
import { snapshotFromLegacyPreOrder, snapshotOrderFulfilment } from "@/lib/fulfilment/snapshot-order";

/** Best-effort fulfilment snapshot so Square orders show on pick lists like Stripe ones. */
export async function snapshotSquareOrderFulfilment(input: {
  orderId: string;
  standId: string;
  ownerId: string;
  productIds: string[];
  preOrderCart: PreOrderCartMeta | null;
}): Promise<void> {
  const { preOrderCart: cart } = input;
  try {
    if (!cart) {
      await snapshotOrderFulfilment({
        orderId: input.orderId,
        standId: input.standId,
        ownerId: input.ownerId,
        isPreOrder: false,
        handoverMode: HandoverMode.COLLECT,
        fulfilmentOptionId: null,
      });
      return;
    }
    const linked = await findScheduledFulfilmentOption(input.productIds);
    if (linked) {
      await snapshotOrderFulfilment({
        orderId: input.orderId,
        standId: input.standId,
        ownerId: input.ownerId,
        isPreOrder: true,
        collectionAt: cart.collectionAt,
        collectionNote: cart.collectionNote,
        handoverMode: cart.handoverMode,
        collectionStatus: "ORDERED",
        fulfilmentOptionId: linked.id,
      });
      return;
    }
    await snapshotFromLegacyPreOrder({
      orderId: input.orderId,
      standId: input.standId,
      ownerId: input.ownerId,
      collectionAt: cart.collectionAt,
      collectionNote: cart.collectionNote,
      handoverMode: cart.handoverMode,
      paymentTiming: cart.paymentTiming,
    });
  } catch (error) {
    console.error("Square order fulfilment snapshot failed", input.orderId, error);
  }
}
