import {
  FulfilmentOptionKind,
  FulfilmentStatus,
} from "@/generated/prisma/client";

const PRODUCTION_CLOSED_FULFILMENT: FulfilmentStatus[] = [
  FulfilmentStatus.COLLECTED,
  FulfilmentStatus.DELIVERED,
  FulfilmentStatus.CANCELLED,
];

/**
 * Whether an order belongs on the Production bake list.
 * Scheduled collection demand only — not farmstand/QR takeaways.
 */
export function isProductionDemandOrder(
  order: {
    isPreOrder: boolean;
    collectionAt: Date | null;
    fulfilment: {
      kind: FulfilmentOptionKind;
      fulfilmentStatus: FulfilmentStatus;
    } | null;
  },
  range: { from: Date; to: Date },
): boolean {
  if (!order.collectionAt) return false;
  if (order.collectionAt < range.from || order.collectionAt >= range.to) {
    return false;
  }
  if (order.fulfilment?.kind === FulfilmentOptionKind.STAND_IMMEDIATE) {
    return false;
  }
  if (order.isPreOrder) return true;
  // Website scheduled pickup/delivery still needing prep.
  if (!order.fulfilment) return false;
  return !PRODUCTION_CLOSED_FULFILMENT.includes(
    order.fulfilment.fulfilmentStatus,
  );
}

export { PRODUCTION_CLOSED_FULFILMENT };
