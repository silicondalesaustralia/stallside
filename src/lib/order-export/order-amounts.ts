import { PaymentStatus } from "@/generated/prisma/client";
import type { ExportOrder } from "./load-export-orders";

const FULLY_PAID: PaymentStatus[] = [
  PaymentStatus.PAID,
  PaymentStatus.CUSTOMER_CONFIRMED,
];

const DEPOSIT_ONLY: PaymentStatus[] = [
  PaymentStatus.DEPOSIT_PAID,
  PaymentStatus.BALANCE_DUE,
  PaymentStatus.BALANCE_FAILED,
];

export type OrderAmounts = {
  surchargeCents: number;
  paidCents: number;
  balanceOwingCents: number;
  feeCents: number;
  netCents: number;
};

export function orderAmounts(order: ExportOrder): OrderAmounts {
  const goodsCents = order.subtotalCents - order.discountCents + (order.shippingCents ?? 0);
  const depositOnly = DEPOSIT_ONLY.includes(order.paymentStatus);
  const paidCents = FULLY_PAID.includes(order.paymentStatus)
    ? order.totalCents
    : depositOnly
      ? (order.depositCents ?? 0)
      : 0;
  const feeCents = paidCents > 0 ? order.platformFeeCents : 0;
  return {
    surchargeCents: Math.max(0, order.totalCents - goodsCents),
    paidCents,
    balanceOwingCents: depositOnly ? (order.balanceCents ?? 0) : 0,
    feeCents,
    netCents: paidCents - feeCents,
  };
}
