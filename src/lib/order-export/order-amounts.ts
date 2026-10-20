import { PaymentStatus } from "@/generated/prisma/client";
import { splitSalesByGst } from "@/lib/gst";
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
  gstFreeCents: number;
  taxableCents: number;
  totalExGstCents: number;
  feeTotalCents: number;
  netCents: number;
};

export function orderAmounts(order: ExportOrder): OrderAmounts {
  const goodsCents = order.subtotalCents - order.discountCents;
  const depositOnly = DEPOSIT_ONLY.includes(order.paymentStatus);
  const paidCents = FULLY_PAID.includes(order.paymentStatus)
    ? order.totalCents
    : depositOnly
      ? (order.depositCents ?? 0)
      : 0;
  const { gstFreeCents, taxableCents } = splitSalesByGst(
    order.items,
    order.discountCents,
  );
  const feeTotalCents =
    (paidCents > 0 ? order.platformFeeCents : 0) +
    (order.processorFeeCents ?? 0) +
    (order.processorFeeTaxCents ?? 0);
  return {
    surchargeCents: Math.max(0, order.totalCents - goodsCents),
    paidCents,
    balanceOwingCents: depositOnly ? (order.balanceCents ?? 0) : 0,
    gstFreeCents,
    taxableCents,
    totalExGstCents: order.totalCents - order.gstCents,
    feeTotalCents,
    netCents: paidCents - feeTotalCents,
  };
}
