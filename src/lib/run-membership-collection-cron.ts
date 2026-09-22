import { after } from "next/server";
import {
  CollectionStatus,
  InventorySource,
  PaymentMethod,
  PaymentStatus,
  PaymentTiming,
  ReceiptChannel,
  ShopperSubStatus,
  SubscriptionOfferKind,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { decrementStockForOrder } from "@/lib/checkout";
import { notifySale } from "@/lib/notify";
import { notifyOrderCustomer } from "@/lib/notify-order-customer";
import { nextCollectionAt } from "@/lib/subscription-offer";
import { supplierLineSnapshot } from "@/lib/suppliers/snapshot";

/** Create due weekly collection orders for active memberships. */
export async function runMembershipCollectionCron(now = new Date()) {
  const due = await prisma.shopperSubscription.findMany({
    where: {
      status: ShopperSubStatus.ACTIVE,
      pausedAt: null,
      collectionsRemaining: { gt: 0 },
      nextCollectionAt: { lte: now },
      offer: { kind: SubscriptionOfferKind.MEMBERSHIP },
    },
    include: {
      offer: {
        include: {
          fulfillmentProduct: true,
        },
      },
    },
    take: 200,
  });

  let created = 0;
  for (const sub of due) {
    try {
      const ok = await createMembershipCollectionOrder(sub, now);
      if (ok) created += 1;
    } catch (error) {
      console.error("Membership collection failed", sub.id, error);
    }
  }
  return { checked: due.length, created };
}

async function createMembershipCollectionOrder(
  sub: {
    id: string;
    standId: string;
    ownerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string | null;
    deliveryAddressLine1: string | null;
    deliverySuburb: string | null;
    deliveryPostcode: string | null;
    deliveryNotes: string | null;
    collectionsRemaining: number | null;
    skipNextCycle: boolean;
    offer: {
      id: string;
      title: string;
      currency: string;
      collectionWeekday: number | null;
      collectionNote: string | null;
      handoverMode: "COLLECT" | "DELIVER";
      weeklyPriceCents: number | null;
      priceCents: number;
      fulfillmentProductId: string | null;
      fulfillmentProduct: {
        id: string;
        name: string;
        priceCents: number;
        isActive: boolean;
        isArchived: boolean;
        memberId: string | null;
        supplierUnitCents: number | null;
      } | null;
    };
  },
  now: Date,
): Promise<boolean> {
  if (sub.skipNextCycle) {
    const next = nextCollectionAt({
      from: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      weekday: sub.offer.collectionWeekday,
      interval: "WEEKLY",
    });
    await prisma.shopperSubscription.update({
      where: { id: sub.id },
      data: { skipNextCycle: false, nextCollectionAt: next },
    });
    return false;
  }

  const product = sub.offer.fulfillmentProduct;
  if (
    !product ||
    !product.isActive ||
    product.isArchived ||
    !sub.offer.fulfillmentProductId
  ) {
    return false;
  }

  const remaining = sub.collectionsRemaining ?? 0;
  if (remaining <= 0) return false;

  const collectionAt = nextCollectionAt({
    from: now,
    weekday: sub.offer.collectionWeekday,
    interval: "WEEKLY",
  });
  const unitPriceCents =
    sub.offer.weeklyPriceCents ?? sub.offer.priceCents ?? product.priceCents;
  const lineCreates = [
    {
      productId: product.id,
      productNameSnapshot: sub.offer.title || product.name,
      optionsSnapshot: null as string | null,
      quantity: 1,
      unitPriceCents,
      lineTotalCents: unitPriceCents,
      ...supplierLineSnapshot(product),
    },
  ];
  const orderNumber = `FS-M${Date.now().toString(36).toUpperCase()}`;
  const nextRemaining = remaining - 1;
  const nextAt = nextCollectionAt({
    from: new Date(collectionAt.getTime() + 7 * 24 * 60 * 60 * 1000),
    weekday: sub.offer.collectionWeekday,
    interval: "WEEKLY",
  });

  const order = await prisma.$transaction(
    async (tx) => {
      const created = await tx.order.create({
        data: {
          standId: sub.standId,
          ownerId: sub.ownerId,
          orderNumber,
          paymentMethod: PaymentMethod.CARD,
          paymentStatus: PaymentStatus.PAID,
          subtotalCents: unitPriceCents,
          totalCents: unitPriceCents,
          currency: sub.offer.currency,
          platformFeeCents: 0,
          receiptEmail: sub.customerEmail,
          receiptChannel: ReceiptChannel.EMAIL,
          isPreOrder: true,
          collectionAt,
          collectionNote: sub.offer.collectionNote,
          customerName: sub.customerName,
          customerPhone: sub.customerPhone,
          collectionStatus: CollectionStatus.ORDERED,
          paymentTiming: PaymentTiming.PAY_UPFRONT,
          handoverMode: sub.offer.handoverMode,
          deliveryAddressLine1: sub.deliveryAddressLine1,
          deliverySuburb: sub.deliverySuburb,
          deliveryPostcode: sub.deliveryPostcode,
          deliveryNotes: sub.deliveryNotes,
          shopperSubscriptionId: sub.id,
          items: { create: lineCreates },
        },
      });

      await decrementStockForOrder(tx, {
        items: [{ productId: product.id, quantity: 1 }],
        byId: new Map([[product.id, { id: product.id, stockQuantity: 99999 }]]),
        ownerId: sub.ownerId,
        standId: sub.standId,
        orderId: created.id,
        source: InventorySource.ORDER_CARD,
        reason: "Membership collection",
      });

      await tx.shopperSubscription.update({
        where: { id: sub.id },
        data: {
          collectionsRemaining: nextRemaining,
          nextCollectionAt: nextRemaining > 0 ? nextAt : null,
          status:
            nextRemaining > 0
              ? ShopperSubStatus.ACTIVE
              : ShopperSubStatus.CANCELLED,
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

  return true;
}
