import {
  HandoverMode,
  MenuKind,
  PaymentTiming,
  type Prisma,
} from "@/generated/prisma/client";

type Tx = Prisma.TransactionClient;

export type MenuScheduleData = {
  isPreOrder: true;
  orderByAt: Date;
  collectionAt: Date;
  collectionNote: string | null;
  showExactStock: boolean;
  paymentTiming: PaymentTiming;
  depositPercent: number | null;
  handoverMode: HandoverMode;
};

export function scheduleFromMenu(menu: {
  orderByAt: Date | null;
  collectionAt: Date | null;
  collectionNote: string | null;
  showExactStock: boolean;
  paymentTiming: PaymentTiming;
  depositPercent: number | null;
  handoverMode: HandoverMode;
}): MenuScheduleData | null {
  if (!menu.orderByAt || !menu.collectionAt) return null;
  return {
    isPreOrder: true,
    orderByAt: menu.orderByAt,
    collectionAt: menu.collectionAt,
    collectionNote: menu.collectionNote,
    showExactStock: menu.showExactStock,
    paymentTiming: menu.paymentTiming,
    depositPercent: menu.depositPercent,
    handoverMode: menu.handoverMode,
  };
}

/** Clear pre-order flags when product is no longer on any scheduled surface. */
export async function clearOrphanedScheduleFlags(
  tx: Tx,
  productIds: string[],
) {
  for (const productId of productIds) {
    const onPage = await tx.preOrderPageProduct.findFirst({
      where: { productId },
      select: { id: true },
    });
    if (onPage) continue;
    const onMenuDrop = await tx.menuProduct.findFirst({
      where: {
        productId,
        menu: { kind: MenuKind.PREORDER_DROP },
      },
      select: { id: true },
    });
    if (onMenuDrop) continue;
    await tx.product.update({
      where: { id: productId },
      data: {
        isPreOrder: false,
        orderByAt: null,
        collectionAt: null,
        collectionNote: null,
        paymentTiming: PaymentTiming.PAY_NOW,
        depositPercent: null,
        handoverMode: HandoverMode.COLLECT,
      },
    });
  }
}
