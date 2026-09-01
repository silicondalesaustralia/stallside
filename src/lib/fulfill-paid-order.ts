import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  InventorySource,
  PaymentMethod,
  PaymentStatus,
  PaymentTiming,
} from "@/generated/prisma/client";
import { notifySale } from "@/lib/notify";
import { notifyOrderCustomer } from "@/lib/notify-order-customer";
import { decrementStockForOrder } from "@/lib/checkout";

export async function fulfillPaidCardOrder(
  orderId: string,
  paymentIntentId?: string | null,
  paymentMethodId?: string | null,
) {
  return fulfillPaidOnlineOrder(orderId, {
    method: PaymentMethod.CARD,
    source: InventorySource.ORDER_CARD,
    reason: "Card sale",
    patch: {
      stripePaymentIntentId: paymentIntentId ?? undefined,
      stripePaymentMethodId: paymentMethodId ?? undefined,
    },
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
      stripePaymentMethodId?: string;
      paypalCaptureId?: string;
    };
  },
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, stand: { select: { cartMode: true } } },
  });
  if (!order) return { error: "Order not found." as const };
  if (
    order.paymentStatus === PaymentStatus.PAID ||
    order.paymentStatus === PaymentStatus.DEPOSIT_PAID ||
    order.paymentStatus === PaymentStatus.BALANCE_DUE
  ) {
    return { orderNumber: order.orderNumber, alreadyPaid: true as const };
  }
  if (order.paymentMethod !== options.method) {
    return { error: "Payment method mismatch." as const };
  }

  const skipStock = order.stand.cartMode === "CUSTOMER_CHOICE";
  const products = skipStock
    ? []
    : await prisma.product.findMany({
        where: { id: { in: order.items.map((i) => i.productId) } },
      });
  const byId = new Map(products.map((p) => [p.id, p]));
  const items = order.items.map((i) => ({
    productId: i.productId,
    quantity: i.quantity,
  }));

  const isDeposit =
    order.paymentTiming === PaymentTiming.DEPOSIT_THEN_BALANCE &&
    (order.balanceCents ?? 0) > 0;

  const nextStatus = isDeposit
    ? PaymentStatus.DEPOSIT_PAID
    : PaymentStatus.PAID;

  try {
    await prisma.$transaction(
      async (tx) => {
        if (!skipStock) {
          await decrementStockForOrder(tx, {
            items,
            byId,
            ownerId: order.ownerId,
            standId: order.standId,
            orderId: order.id,
            source: options.source,
            reason: isDeposit ? "Deposit reserved" : options.reason,
          });
        }
        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: nextStatus,
            stripePaymentIntentId:
              options.patch.stripePaymentIntentId ??
              order.stripePaymentIntentId,
            stripePaymentMethodId:
              options.patch.stripePaymentMethodId ??
              order.stripePaymentMethodId,
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

  if (!order.customerId && order.receiptEmail) {
    try {
      const { linkOrderToCustomer } = await import("@/lib/catalogue/customers");
      await linkOrderToCustomer({
        orderId: order.id,
        ownerId: order.ownerId,
        email: order.receiptEmail,
        name: order.customerName,
        phone: order.customerPhone,
      });
    } catch (err) {
      console.error("Customer link failed", err);
    }
  }

  after(() => {
    void notifySale(orderId).catch((error) => {
      console.error("Sale notify failed", error);
    });
    void notifyOrderCustomer(orderId).catch((error) => {
      console.error("Customer order email failed", error);
    });
  });

  return { orderNumber: order.orderNumber, alreadyPaid: false as const };
}
