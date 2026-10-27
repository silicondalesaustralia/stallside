import { PaymentMethod, PaymentStatus } from "@/generated/prisma/client";
import { localTransferMethodById } from "@/lib/local-transfer";

export function isCustomerConfirmedMethod(method: PaymentMethod): boolean {
  return (
    method === PaymentMethod.CASH || method === PaymentMethod.LOCAL_TRANSFER
  );
}

export function orderPaymentLabel(
  method: PaymentMethod,
  localTransferMethodId?: string | null,
  status?: PaymentStatus,
): string {
  const confirmation =
    status === PaymentStatus.PAID ? "received" : "customer-confirmed";
  if (method === PaymentMethod.LOCAL_TRANSFER) {
    const configured = localTransferMethodById(localTransferMethodId);
    const name = configured?.id ?? "transfer";
    return `${name} · ${confirmation}`;
  }
  if (method === PaymentMethod.CASH) {
    return `cash · ${confirmation}`;
  }
  if (method === PaymentMethod.CARD) {
    return "card · verified";
  }
  if (method === PaymentMethod.PAYPAL) {
    return "paypal · verified";
  }
  if (method === PaymentMethod.SQUARE) {
    return "square · verified";
  }
  return "unknown";
}

const ABANDONED_STATUSES: PaymentStatus[] = [
  PaymentStatus.EXPIRED,
  PaymentStatus.CANCELLED,
];

/** Checkout was started but no money was taken. */
export function isAbandonedPaymentStatus(status: PaymentStatus): boolean {
  return ABANDONED_STATUSES.includes(status);
}

export function paymentStatusNote(status: PaymentStatus): string {
  if (status === PaymentStatus.PENDING) return "awaiting payment";
  if (isAbandonedPaymentStatus(status)) return "abandoned · not paid";
  if (status === PaymentStatus.FAILED) return "payment failed";
  return status.toLowerCase().replaceAll("_", " ");
}
