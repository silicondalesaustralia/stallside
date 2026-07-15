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
): string {
  if (method === PaymentMethod.LOCAL_TRANSFER) {
    const configured = localTransferMethodById(localTransferMethodId);
    const name = configured?.id ?? "transfer";
    return `${name} · customer-confirmed`;
  }
  if (method === PaymentMethod.CASH) {
    return "cash · customer-confirmed";
  }
  if (method === PaymentMethod.CARD) {
    return "card · verified";
  }
  if (method === PaymentMethod.PAYPAL) {
    return "paypal · verified";
  }
  return "unknown";
}

export function paymentStatusNote(status: PaymentStatus): string {
  return status.toLowerCase().replaceAll("_", " ");
}
