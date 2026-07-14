import { prisma } from "@/lib/prisma";
import {
  InventorySource,
  PaymentMethod,
  PaymentStatus,
} from "@/generated/prisma/client";
import { PLATFORM_FEE_BPS } from "@/lib/constants";
import { platformFeeCents } from "@/lib/money";
import { notifySale } from "@/lib/notify";
import { decrementStockForOrder } from "@/lib/checkout";

export async function fulfillPaidCardOrder(
  orderId: string,
  paymentIntentId?: string | null,
) {
  return fulfillPaidOnlineOrder(orderId, {
    method: PaymentMethod.CARD,
    source: InventorySource.ORDER_CARD,
    reason: "Card sale",
    patch: { stripePaymentIntentId: paymentIntentId ?? undefined },
  });
}

export async function fulfillPaidPayPalOrder(
  orderId: string,
  captureId?: string | null,
) {
  return fulfillPaidOnlineOrder(orderId, {
    method: PaymentMethod.PAYPAL,
    source: InventorySource.ORDER_PAYPAL,
    reason: "PayPal sale",
    patch: { paypalCaptureId: captureId ?? undefined },
  });
}

async function fulfillPaidOnlineOrder(
  orderId: string,
  options: {
    method: typeof PaymentMethod.CARD | typeof PaymentMethod.PAYPAL;
    source: typeof InventorySource.ORDER_CARD | typeof InventorySource.ORDER_PAYPAL;
    reason: string;
    patch: {
      stripePaymentIntentId?: string;
      paypalCaptureId?: string;
    };
  },
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return { error: "Order not found." as const };
  if (order.paymentStatus === PaymentStatus.PAID) {
    return { orderNumber: order.orderNumber, alreadyPaid: true as const };
  }
  if (order.paymentMethod !== options.method) {
    return { error: "Payment method mismatch." as const };
  }

  const products = await prisma.product.findMany({
    where: { id: { in: order.items.map((i) => i.productId) } },
  });
  const byId = new Map(products.map((p) => [p.id, p]));
  const items = order.items.map((i) => ({
    productId: i.productId,
    quantity: i.quantity,
  }));
  const fee = platformFeeCents(order.totalCents, PLATFORM_FEE_BPS);

  try {
    await prisma.$transaction(
      async (tx) => {
        await decrementStockForOrder(tx, {
          items,
          byId,
          ownerId: order.ownerId,
          standId: order.standId,
          orderId: order.id,
          source: options.source,
          reason: options.reason,
        });
        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: PaymentStatus.PAID,
            platformFeeCents: fee,
            stripePaymentIntentId:
              options.patch.stripePaymentIntentId ?? order.stripePaymentIntentId,
            paypalCaptureId:
              options.patch.paypalCaptureId ?? order.paypalCaptureId,
          },
        });
      },
      { maxWait: 10_000, timeout: 30_000 },
    );
  } catch (error) {
    if (error instanceof Error && error.message === "STOCK") {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: PaymentStatus.FAILED },
      });
      return {
        error: "Paid but stock unavailable - contact the stand owner." as const,
      };
    }
    throw error;
  }

  try {
    await notifySale(orderId);
  } catch (error) {
    console.error("Sale notify failed", error);
  }

  return { orderNumber: order.orderNumber, alreadyPaid: false as const };
}
