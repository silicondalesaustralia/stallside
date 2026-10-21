import { PaymentMethod, SaleOrigin } from "@/generated/prisma/client";
import { localTransferMethodById } from "@/lib/local-transfer";
import { orderSalesChannel } from "@/lib/sales-series";

export function paymentMethodName(
  method: PaymentMethod,
  localTransferMethodId: string | null,
): string {
  if (method === PaymentMethod.CASH) return "Cash";
  if (method === PaymentMethod.LOCAL_TRANSFER) {
    const label = localTransferMethodById(localTransferMethodId)?.buttonLabel;
    return label ? `Bank transfer (${label})` : "Bank transfer";
  }
  if (method === PaymentMethod.CARD) return "Card";
  if (method === PaymentMethod.PAYPAL) return "PayPal";
  return "Card (Square)";
}

export function paymentProviderName(method: PaymentMethod): string {
  if (method === PaymentMethod.CARD) return "Stripe";
  if (method === PaymentMethod.SQUARE) return "Square";
  if (method === PaymentMethod.PAYPAL) return "PayPal";
  return "";
}

export function providerPaymentId(order: {
  paymentMethod: PaymentMethod;
  stripePaymentIntentId: string | null;
  stripeInvoiceId: string | null;
  squarePaymentId: string | null;
  paypalCaptureId: string | null;
  paypalOrderId: string | null;
}): string {
  if (order.paymentMethod === PaymentMethod.CARD) {
    return order.stripePaymentIntentId ?? order.stripeInvoiceId ?? "";
  }
  if (order.paymentMethod === PaymentMethod.SQUARE) return order.squarePaymentId ?? "";
  if (order.paymentMethod === PaymentMethod.PAYPAL) {
    return order.paypalCaptureId ?? order.paypalOrderId ?? "";
  }
  return "";
}

const CHANNEL_LABEL = {
  stand: "Shop",
  preorder: "Pre-order",
  subscription: "Subscription",
} as const;

export function channelName(order: {
  isPreOrder: boolean;
  shopperSubscriptionId: string | null;
}): string {
  return CHANNEL_LABEL[orderSalesChannel(order)];
}

const ORIGIN_LABEL: Record<SaleOrigin, string> = {
  VENDL_WEB: "Online",
  FARM_STAND: "Farm stand",
  SQUARE_POS: "Square POS",
  MARKET: "Market",
  MANUAL: "Manual",
};

export function saleOriginName(origin: SaleOrigin): string {
  return ORIGIN_LABEL[origin];
}

export function statusName(status: string): string {
  const words = status.toLowerCase().replaceAll("_", " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}
