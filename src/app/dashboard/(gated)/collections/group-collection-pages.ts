import { PaymentStatus, PaymentTiming } from "@/generated/prisma/client";
import { formatCollectionLabel } from "@/lib/pre-order";
import type { CollectionOrderView } from "./group-collections";
import type { CollectionSubscriptionOfferRef } from "./load-subscription-offers";

export type CollectionPageRef = {
  id: string;
  title: string;
  collectionAt: Date;
  orderByAt: Date;
  productIds: string[];
  upsellProductId: string | null;
};

export type CollectionPageGroup = {
  key: string;
  title: string;
  collectionLabel: string;
  orders: CollectionOrderView[];
  itemCount: number;
  takenCents: number;
  currency: string;
  windowClosed: boolean;
};

function takenCentsFor(order: CollectionOrderView): number {
  if (
    order.paymentTiming === PaymentTiming.DEPOSIT_THEN_BALANCE &&
    order.paymentStatus !== PaymentStatus.PAID
  ) {
    return order.depositCents ?? 0;
  }
  return order.totalCents;
}

function scoreOrderToPage(
  order: CollectionOrderView,
  page: CollectionPageRef,
): number {
  const at = order.collectionAt;
  if (!at) return 0;
  const sameDay =
    at.toISOString().slice(0, 10) ===
    page.collectionAt.toISOString().slice(0, 10);
  if (!sameDay) return 0;
  const sameInstant = at.getTime() === page.collectionAt.getTime();
  const pageProducts = new Set(page.productIds);
  if (page.upsellProductId) pageProducts.add(page.upsellProductId);
  const matched = order.items.filter(
    (item) => item.productId && pageProducts.has(item.productId),
  ).length;
  if (matched === 0 && !sameInstant) return 0;
  return (sameInstant ? 100 : 20) + matched * 10;
}

function toGroup(
  key: string,
  title: string,
  collectionAt: Date | null,
  orders: CollectionOrderView[],
): CollectionPageGroup {
  const itemCount = orders.reduce(
    (sum, order) => sum + order.items.reduce((s, i) => s + i.quantity, 0),
    0,
  );
  const takenCents = orders.reduce(
    (sum, order) => sum + takenCentsFor(order),
    0,
  );
  const at =
    collectionAt ?? orders.find((o) => o.collectionAt)?.collectionAt ?? null;
  return {
    key,
    title,
    collectionLabel: at ? formatCollectionLabel(at) : "Pre-orders",
    orders,
    itemCount,
    takenCents,
    currency: orders[0]?.currency ?? "AUD",
    windowClosed: at ? at.getTime() <= Date.now() : false,
  };
}

function groupSubscriptionOrders(
  orders: CollectionOrderView[],
  offers: CollectionSubscriptionOfferRef[],
): { groups: CollectionPageGroup[]; remaining: CollectionOrderView[] } {
  const byOffer = new Map<string, CollectionOrderView[]>();
  const remaining: CollectionOrderView[] = [];
  const titleById = new Map(offers.map((o) => [o.id, o.title]));

  for (const order of orders) {
    const offerId = order.subscriptionOfferId;
    if (!offerId) {
      remaining.push(order);
      continue;
    }
    const list = byOffer.get(offerId) ?? [];
    list.push(order);
    byOffer.set(offerId, list);
  }

  const groups = [...byOffer.entries()]
    .map(([offerId, list]) => {
      const title =
        titleById.get(offerId) ??
        list[0]?.subscriptionOfferTitle ??
        "Subscription";
      return toGroup(
        `sub-${offerId}`,
        `Subscription · ${title}`,
        list[0]?.collectionAt ?? null,
        list,
      );
    })
    .sort((a, b) => {
      const aAt = a.orders[0]?.collectionAt?.getTime() ?? 0;
      const bAt = b.orders[0]?.collectionAt?.getTime() ?? 0;
      return aAt - bAt;
    });

  return { groups, remaining };
}

/** Assign paid pre-orders to subscription offers + pre-order pages. */
export function groupCollectionPages(
  orders: CollectionOrderView[],
  pages: CollectionPageRef[],
  offers: CollectionSubscriptionOfferRef[] = [],
): CollectionPageGroup[] {
  const { groups: subGroups, remaining } = groupSubscriptionOrders(
    orders,
    offers,
  );

  if (pages.length === 0) {
    const byDay = new Map<string, CollectionOrderView[]>();
    for (const order of remaining) {
      const key = order.collectionAt?.toISOString().slice(0, 10) ?? "unknown";
      const list = byDay.get(key) ?? [];
      list.push(order);
      byDay.set(key, list);
    }
    const dayGroups = [...byDay.entries()].map(([key, list]) => {
      const at = list[0]?.collectionAt ?? null;
      const title = at ? formatCollectionLabel(at) : "Pre-orders";
      return toGroup(key, title, at, list);
    });
    return [...subGroups, ...dayGroups];
  }

  const assigned = new Map<string, CollectionOrderView[]>();
  const unmatched: CollectionOrderView[] = [];

  for (const order of remaining) {
    let bestId: string | null = null;
    let bestScore = 0;
    for (const page of pages) {
      const score = scoreOrderToPage(order, page);
      if (score > bestScore) {
        bestScore = score;
        bestId = page.id;
      }
    }
    if (!bestId) {
      unmatched.push(order);
      continue;
    }
    const list = assigned.get(bestId) ?? [];
    list.push(order);
    assigned.set(bestId, list);
  }

  const pageGroups = pages
    .filter((page) => assigned.has(page.id))
    .sort((a, b) => a.collectionAt.getTime() - b.collectionAt.getTime())
    .map((page) =>
      toGroup(page.id, page.title, page.collectionAt, assigned.get(page.id)!),
    );

  if (unmatched.length > 0) {
    pageGroups.push(
      toGroup(
        "other",
        "Other pre-orders",
        unmatched[0]?.collectionAt ?? null,
        unmatched,
      ),
    );
  }
  return [...subGroups, ...pageGroups];
}
