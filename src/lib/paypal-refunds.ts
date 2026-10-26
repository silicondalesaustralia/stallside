import { prisma } from "@/lib/prisma";
import { PaymentMethod, PaymentStatus } from "@/generated/prisma/client";
import { isPayPalLiveMode, paypalFetch } from "@/lib/paypal";

type Money = { value?: string };

type PayPalOrderPayments = {
  purchase_units?: Array<{
    payments?: {
      captures?: Array<{ id?: string; status?: string }>;
      refunds?: Array<{ status?: string; amount?: Money }>;
    };
  }>;
};

/** Seller refunds from their own PayPal account (no partner refund permission). */
export function paypalTransactionUrl(captureId: string): string {
  const host = isPayPalLiveMode() ? "www.paypal.com" : "www.sandbox.paypal.com";
  return `https://${host}/activity/payment/${encodeURIComponent(captureId)}`;
}

function toCents(amount: Money | undefined): number {
  const value = Number.parseFloat(amount?.value ?? "0");
  return Number.isFinite(value) ? Math.round(value * 100) : 0;
}

export type PayPalRefundSync = {
  refundedCents: number;
  fullyRefunded: boolean;
};

/** Read refunds off the PayPal order and store them on the Vendl order. */
export async function syncPayPalRefund(orderId: string): Promise<PayPalRefundSync> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      paymentMethod: true,
      paymentStatus: true,
      paypalOrderId: true,
      totalCents: true,
    },
  });
  if (!order || order.paymentMethod !== PaymentMethod.PAYPAL || !order.paypalOrderId) {
    throw new Error("Not a PayPal order.");
  }

  const data = await paypalFetch<PayPalOrderPayments>(
    `/v2/checkout/orders/${encodeURIComponent(order.paypalOrderId)}`,
  );
  const payments = data.purchase_units?.[0]?.payments;
  const captureStatus = payments?.captures?.[0]?.status ?? "";
  const summed = (payments?.refunds ?? [])
    .filter((r) => r.status === "COMPLETED")
    .reduce((sum, r) => sum + toCents(r.amount), 0);

  const fullByStatus = captureStatus === "REFUNDED" || captureStatus === "REVERSED";
  const fullyRefunded = fullByStatus || summed >= order.totalCents;
  const refundedCents = fullyRefunded ? order.totalCents : summed;

  await prisma.order.update({
    where: { id: order.id },
    data: {
      refundedCents: refundedCents > 0 ? refundedCents : null,
      ...(fullyRefunded && order.paymentStatus === PaymentStatus.PAID
        ? { paymentStatus: PaymentStatus.REFUNDED }
        : {}),
    },
  });

  return { refundedCents, fullyRefunded };
}

type RefundEventResource = {
  custom_id?: string;
  links?: Array<{ href?: string; rel?: string }>;
};

function captureIdFromLinks(resource: RefundEventResource): string | null {
  const up = resource.links?.find((l) => l.rel === "up")?.href ?? "";
  const match = up.match(/\/captures\/([^/?]+)/);
  return match?.[1] ?? null;
}

/** PAYMENT.CAPTURE.REFUNDED / REVERSED: resource is the refund, linked to its capture. */
export async function handlePayPalRefundEvent(resource: RefundEventResource) {
  const captureId = captureIdFromLinks(resource);
  const order = await prisma.order.findFirst({
    where: {
      paymentMethod: PaymentMethod.PAYPAL,
      OR: [
        ...(captureId ? [{ paypalCaptureId: captureId }] : []),
        ...(resource.custom_id ? [{ id: resource.custom_id }] : []),
      ],
    },
    select: { id: true },
  });
  if (!order) return;
  await syncPayPalRefund(order.id);
}
