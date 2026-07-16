import { paypalFetch } from "@/lib/paypal";
import { capturePayPalOrder } from "@/lib/paypal-orders";
import { fulfillPaidPayPalOrder } from "@/lib/fulfill-paid-order";
import { prisma } from "@/lib/prisma";
import { PaymentMethod, PaymentStatus } from "@/generated/prisma/client";

type WebhookResource = {
  id?: string;
  status?: string;
  custom_id?: string;
  supplementary_data?: { related_ids?: { order_id?: string } };
  purchase_units?: Array<{
    custom_id?: string;
    payments?: { captures?: Array<{ id?: string; status?: string }> };
  }>;
};

type WebhookEvent = {
  event_type?: string;
  resource?: WebhookResource;
};

export async function verifyPayPalWebhookSignature(
  headers: Headers,
  rawBody: string,
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) return false;

  let webhookEvent: unknown;
  try {
    webhookEvent = JSON.parse(rawBody) as unknown;
  } catch {
    return false;
  }

  const authAlgo = headers.get("paypal-auth-algo");
  const certUrl = headers.get("paypal-cert-url");
  const transmissionId = headers.get("paypal-transmission-id");
  const transmissionSig = headers.get("paypal-transmission-sig");
  const transmissionTime = headers.get("paypal-transmission-time");
  if (
    !authAlgo ||
    !certUrl ||
    !transmissionId ||
    !transmissionSig ||
    !transmissionTime
  ) {
    return false;
  }

  try {
    const result = await paypalFetch<{ verification_status?: string }>(
      "/v1/notifications/verify-webhook-signature",
      {
        method: "POST",
        body: JSON.stringify({
          auth_algo: authAlgo,
          cert_url: certUrl,
          transmission_id: transmissionId,
          transmission_sig: transmissionSig,
          transmission_time: transmissionTime,
          webhook_id: webhookId,
          webhook_event: webhookEvent,
        }),
      },
    );
    return result.verification_status === "SUCCESS";
  } catch (error) {
    console.error("PayPal webhook verify failed", error);
    return false;
  }
}

async function findPayPalOrder(resource: WebhookResource) {
  const stallsideId =
    resource.custom_id || resource.purchase_units?.[0]?.custom_id;
  if (stallsideId) {
    const byId = await prisma.order.findUnique({ where: { id: stallsideId } });
    if (byId?.paymentMethod === PaymentMethod.PAYPAL) return byId;
  }

  const paypalOrderId =
    resource.supplementary_data?.related_ids?.order_id || resource.id;
  if (!paypalOrderId) return null;

  return prisma.order.findFirst({
    where: {
      paypalOrderId,
      paymentMethod: PaymentMethod.PAYPAL,
    },
  });
}

export async function handlePayPalWebhookEvent(rawBody: string): Promise<void> {
  const event = JSON.parse(rawBody) as WebhookEvent;
  const type = event.event_type;
  const resource = event.resource;
  if (!type || !resource) return;

  if (type === "PAYMENT.CAPTURE.COMPLETED") {
    const order = await findPayPalOrder(resource);
    if (!order || order.paymentStatus === PaymentStatus.PAID) return;
    await fulfillPaidPayPalOrder(order.id, resource.id ?? null);
    return;
  }

  if (
    type === "CHECKOUT.ORDER.APPROVED" ||
    type === "CHECKOUT.ORDER.COMPLETED"
  ) {
    const order = await findPayPalOrder(resource);
    if (!order || order.paymentStatus === PaymentStatus.PAID) return;
    if (!order.paypalOrderId) return;

    const captureIdFromEvent =
      resource.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? null;

    if (type === "CHECKOUT.ORDER.APPROVED" && !captureIdFromEvent) {
      const captured = await capturePayPalOrder(order.paypalOrderId);
      const captureId =
        captured.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? null;
      await fulfillPaidPayPalOrder(order.id, captureId);
      return;
    }

    await fulfillPaidPayPalOrder(order.id, captureIdFromEvent);
  }
}
