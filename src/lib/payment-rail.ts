import {
  OnlinePaymentProvider,
  PaymentMethod,
  type Prisma,
} from "@/generated/prisma/client";

export type PaymentProviderLabel = "Stripe" | "Square" | "PayPal" | "Direct";
export type PaymentTypeLabel = "Card" | "PayID" | "Cash" | "Other";

type RailFields = {
  paymentMethod: PaymentMethod;
  onlinePaymentProvider: OnlinePaymentProvider | null;
  squarePaymentId: string | null;
  localTransferMethodId: string | null;
};

/** Orders whose payment (and Vendl app fee) ran through Square. */
export const squareOrderWhere: Prisma.OrderWhereInput = {
  OR: [
    { paymentMethod: PaymentMethod.SQUARE },
    { onlinePaymentProvider: OnlinePaymentProvider.SQUARE },
    { squarePaymentId: { not: null } },
  ],
};

/** Complement of `squareOrderWhere`, minus PayPal; NULL-safe on the provider column. */
export const stripeOrderWhere: Prisma.OrderWhereInput = {
  paymentMethod: { notIn: [PaymentMethod.SQUARE, PaymentMethod.PAYPAL] },
  squarePaymentId: null,
  OR: [
    { onlinePaymentProvider: null },
    { onlinePaymentProvider: { not: OnlinePaymentProvider.SQUARE } },
  ],
};

export function isSquareOrder(order: RailFields): boolean {
  return (
    order.paymentMethod === PaymentMethod.SQUARE ||
    order.onlinePaymentProvider === OnlinePaymentProvider.SQUARE ||
    order.squarePaymentId !== null
  );
}

export function paymentProviderLabel(order: RailFields): PaymentProviderLabel {
  if (isSquareOrder(order)) return "Square";
  if (order.paymentMethod === PaymentMethod.PAYPAL) return "PayPal";
  if (order.paymentMethod === PaymentMethod.CARD) return "Stripe";
  return "Direct";
}

export function paymentTypeLabel(order: RailFields): PaymentTypeLabel {
  switch (order.paymentMethod) {
    case PaymentMethod.CARD:
    case PaymentMethod.SQUARE:
      return "Card";
    case PaymentMethod.CASH:
      return "Cash";
    case PaymentMethod.LOCAL_TRANSFER:
      return order.localTransferMethodId === "payid" ? "PayID" : "Other";
    default:
      return "Other";
  }
}
