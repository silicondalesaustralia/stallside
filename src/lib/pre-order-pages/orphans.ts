import { HandoverMode, PaymentTiming, type Prisma } from "@/generated/prisma/client";

/** Products no longer on any pre-order page go back to normal (not pre-order) products. */
export async function clearOrphanedPreOrderFlags(tx: Prisma.TransactionClient, productIds: string[]) {
  for (const productId of productIds) {
    const stillOnPage = await tx.preOrderPageProduct.findFirst({
      where: { productId },
      select: { id: true },
    });
    if (stillOnPage) continue;
    await tx.product.update({
      where: { id: productId },
      data: {
        isPreOrder: false,
        orderByAt: null,
        collectionAt: null,
        collectionNote: null,
        paymentTiming: PaymentTiming.PAY_NOW,
        paymentOptions: [],
        depositPercent: null,
        handoverMode: HandoverMode.COLLECT,
      },
    });
  }
}
