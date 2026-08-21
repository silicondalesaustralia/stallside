import type Stripe from "stripe";
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
import {
  paymentIntentIdFromInvoice,
  subscriptionIdFromInvoice,
} from "@/lib/stripe-invoice-ids";

/** Create a stand Order from a paid Connect subscription invoice (idempotent). */
export async function fulfillShopperSubscriptionInvoice(
  invoice: Stripe.Invoice,
) {
  if (invoice.amount_paid <= 0) return;
  const invoiceId = invoice.id;
  if (!invoiceId) return;

  const existing = await prisma.order.findUnique({
    where: { stripeInvoiceId: invoiceId },
    select: { id: true },
  });
  if (existing) return;

  const subscriptionId = subscriptionIdFromInvoice(invoice);
  if (!subscriptionId) return;

  const metaSubId =
    invoice.metadata?.shopperSubscriptionId ??
    invoice.parent?.subscription_details?.metadata?.shopperSubscriptionId;

  const sub = await prisma.shopperSubscription.findFirst({
    where: metaSubId
      ? {
          OR: [
            { stripeSubscriptionId: subscriptionId },
            { id: String(metaSubId) },
          ],
        }
      : { stripeSubscriptionId: subscriptionId },
    include: {
      offer: {
        include: {
          items: {
            orderBy: { sortOrder: "asc" },
            include: { product: true },
          },
        },
      },
    },
  });
  if (!sub) return;

  if (!sub.stripeSubscriptionId) {
    await prisma.shopperSubscription.update({
      where: { id: sub.id },
      data: {
        stripeSubscriptionId: subscriptionId,
        status: ShopperSubStatus.ACTIVE,
      },
    });
  }

  if (sub.skipNextCycle) {
    await prisma.shopperSubscription.update({
      where: { id: sub.id },
      data: { skipNextCycle: false },
    });
    return;
  }

  if (
    sub.status === ShopperSubStatus.CANCELLED ||
    sub.status === ShopperSubStatus.PAUSED
  ) {
    return;
  }

  const offer = sub.offer;
  const liveItems = offer.items.filter(
    (i) => i.product.isActive && !i.product.isArchived,
  );
  if (liveItems.length === 0) return;

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
  }));
  const subtotalCents = lineCreates.reduce((s, l) => s + l.lineTotalCents, 0);
  const fee = 0;
  const byId = new Map(liveItems.map((i) => [i.product.id, i.product]));
  const orderNumber = `FS-S${Date.now().toString(36).toUpperCase()}`;

  const order = await prisma.$transaction(
    async (tx) => {
      const created = await tx.order.create({
        data: {
          standId: sub.standId,
          ownerId: sub.ownerId,
          orderNumber,
          paymentMethod: PaymentMethod.CARD,
          paymentStatus: PaymentStatus.PAID,
          subtotalCents,
          totalCents: subtotalCents,
          currency: offer.currency,
          platformFeeCents: fee,
          stripeInvoiceId: invoiceId,
          stripePaymentIntentId: paymentIntentIdFromInvoice(invoice),
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
        items: lineCreates.map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
        })),
        byId,
        ownerId: sub.ownerId,
        standId: sub.standId,
        orderId: created.id,
        source: InventorySource.ORDER_CARD,
        reason: "Subscription cycle",
      });

      await tx.shopperSubscription.update({
        where: { id: sub.id },
        data: {
          status: ShopperSubStatus.ACTIVE,
          nextCollectionAt: collectionAt,
        },
      });

      return created;
    },
    { maxWait: 10_000, timeout: 30_000 },
  );

  after(() => {
    void notifySale(order.id).catch((error) => {
      console.error("Sale notify failed", error);
    });
    void notifyOrderCustomer(order.id).catch((error) => {
      console.error("Customer order email failed", error);
    });
  });
}
