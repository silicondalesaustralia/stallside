import { after } from "next/server";
import {
  CollectionStatus,
  InventorySource,
  PaymentMethod,
  PaymentStatus,
  PaymentTiming,
  ReceiptChannel,
  ShopperSubStatus,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { decrementStockForOrder } from "@/lib/checkout";
import { notifySale } from "@/lib/notify";
import { notifyOrderCustomer } from "@/lib/notify-order-customer";
import { nextCollectionAt } from "@/lib/subscription-offer";
import { supplierLineSnapshot } from "@/lib/suppliers/snapshot";
import { snapshotSubscriptionCycleFulfilment } from "@/lib/subscription-cycle-snapshot";

export type CycleOrderPayment =
  | { rail: "stripe"; stripeInvoiceId: string; stripePaymentIntentId: string | null }
  | { rail: "square"; squarePaymentId: string; platformFeeCents: number };

/** Create the pickup / delivery order for one paid box-subscription cycle. */
export async function createSubscriptionCycleOrder(
  shopperSubscriptionId: string,
  payment: CycleOrderPayment,
): Promise<string | null> {
  const sub = await prisma.shopperSubscription.findUnique({
    where: { id: shopperSubscriptionId },
    include: {
      offer: {
        include: {
          items: { orderBy: { sortOrder: "asc" }, include: { product: true } },
        },
      },
    },
  });
  if (!sub) return null;

  const offer = sub.offer;
  const liveItems = offer.items.filter((i) => i.product.isActive && !i.product.isArchived);
  if (liveItems.length === 0) return null;

  const collectionAt = nextCollectionAt({
    from: new Date(),
    weekday: offer.collectionWeekday,
    interval: offer.interval,
  });
  const lineCreates = liveItems.map((i) => ({
    productId: i.productId,
    productNameSnapshot: i.product.name,
    optionsSnapshot: null as string | null,
    quantity: i.quantity,
    unitPriceCents: i.product.priceCents,
    lineTotalCents: i.product.priceCents * i.quantity,
    ...supplierLineSnapshot(i.product),
  }));
  const subtotalCents = lineCreates.reduce((s, l) => s + l.lineTotalCents, 0);
  const byId = new Map(liveItems.map((i) => [i.product.id, i.product]));
  const orderNumber = `FS-S${Date.now().toString(36).toUpperCase()}`;
  const paymentFields =
    payment.rail === "stripe"
      ? {
          paymentMethod: PaymentMethod.CARD,
          platformFeeCents: 0,
          stripeInvoiceId: payment.stripeInvoiceId,
          stripePaymentIntentId: payment.stripePaymentIntentId,
        }
      : {
          paymentMethod: PaymentMethod.SQUARE,
          platformFeeCents: payment.platformFeeCents,
          squarePaymentId: payment.squarePaymentId,
        };

  const order = await prisma.$transaction(
    async (tx) => {
      const created = await tx.order.create({
        data: {
          standId: sub.standId,
          ownerId: sub.ownerId,
          orderNumber,
          ...paymentFields,
          paymentStatus: PaymentStatus.PAID,
          subtotalCents,
          totalCents: subtotalCents,
          currency: offer.currency,
          receiptEmail: sub.customerEmail,
          receiptChannel: ReceiptChannel.EMAIL,
          isPreOrder: true,
          collectionAt,
          collectionNote: offer.collectionNote,
          customerName: sub.customerName,
          customerPhone: sub.customerPhone,
          collectionStatus: CollectionStatus.ORDERED,
          paymentTiming: PaymentTiming.PAY_UPFRONT,
          handoverMode: offer.handoverMode,
          deliveryAddressLine1: sub.deliveryAddressLine1,
          deliverySuburb: sub.deliverySuburb,
          deliveryPostcode: sub.deliveryPostcode,
          deliveryNotes: sub.deliveryNotes,
          shopperSubscriptionId: sub.id,
          items: { create: lineCreates },
        },
      });
      await decrementStockForOrder(tx, {
        items: lineCreates.map((l) => ({ productId: l.productId, quantity: l.quantity })),
        byId,
        ownerId: sub.ownerId,
        standId: sub.standId,
        orderId: created.id,
        source: InventorySource.ORDER_CARD,
        reason: "Subscription cycle",
      });
      await tx.shopperSubscription.update({
        where: { id: sub.id },
        data: { status: ShopperSubStatus.ACTIVE, nextCollectionAt: collectionAt },
      });
      return created;
    },
    { maxWait: 10_000, timeout: 30_000 },
  );

  await snapshotSubscriptionCycleFulfilment({
    orderId: order.id,
    standId: sub.standId,
    ownerId: sub.ownerId,
    offerId: offer.id,
    collectionAt,
    collectionNote: offer.collectionNote,
    handoverMode: offer.handoverMode,
  });

  after(() =>
    Promise.allSettled([
      notifySale(order.id).catch((error) => {
        console.error("Sale notify failed", error);
      }),
      notifyOrderCustomer(order.id).catch((error) => {
        console.error("Customer order email failed", error);
      }),
    ]),
  );
  return order.id;
}
