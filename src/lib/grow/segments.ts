import { PaymentStatus, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  parseSegmentRules,
  SEGMENT_PRESETS,
  type SegmentRules,
} from "@/lib/grow/segment-rules";

export {
  parseSegmentRules,
  SEGMENT_PRESETS,
  type SegmentRules,
} from "@/lib/grow/segment-rules";

/** Qualifying payment statuses for CRM / segments / loyalty (same as sales). */
export const GROW_ORDER_STATUSES: PaymentStatus[] = [
  PaymentStatus.PAID,
  PaymentStatus.CUSTOMER_CONFIRMED,
  PaymentStatus.DEPOSIT_PAID,
  PaymentStatus.BALANCE_DUE,
  PaymentStatus.BALANCE_FAILED,
];

/**
 * Resolve customer IDs matching segment rules for an owner.
 * Marketing suppression is applied separately at send time.
 */
export async function resolveSegmentCustomerIds(
  ownerId: string,
  rules: SegmentRules,
  limit = 5000,
): Promise<string[]> {
  const customers = await prisma.customer.findMany({
    where: { ownerId, email: { not: null } },
    select: {
      id: true,
      email: true,
      marketingConsent: true,
      createdAt: true,
      tagLinks: { select: { tagId: true } },
      restockSubscribers: {
        where: { status: "ACTIVE" },
        select: { id: true },
        take: 1,
      },
      shopperSubscriptions: {
        where: { status: "ACTIVE" },
        select: { id: true },
        take: 1,
      },
      orders: {
        where: { paymentStatus: { in: GROW_ORDER_STATUSES } },
        select: {
          id: true,
          totalCents: true,
          createdAt: true,
          items: { select: { productId: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    take: 20_000,
  });

  const now = Date.now();
  const dayMs = 86_400_000;
  const matched: string[] = [];

  let menuProductIds: Set<string> | null = null;
  if (rules.menuIds?.length) {
    const items = await prisma.menuProduct.findMany({
      where: { menuId: { in: rules.menuIds }, menu: { ownerId } },
      select: { productId: true },
    });
    menuProductIds = new Set(items.map((i) => i.productId));
  }

  let categoryProductIds: Set<string> | null = null;
  if (rules.categoryIds?.length) {
    const links = await prisma.productCategory.findMany({
      where: {
        categoryId: { in: rules.categoryIds },
        category: { ownerId },
      },
      select: { productId: true },
    });
    categoryProductIds = new Set(links.map((l) => l.productId));
  }

  for (const c of customers) {
    if (rules.marketingConsent === true && !c.marketingConsent) continue;
    if (rules.marketingConsent === false && c.marketingConsent) continue;

    if (rules.tagIds?.length) {
      const tags = new Set(c.tagLinks.map((t) => t.tagId));
      if (!rules.tagIds.some((id) => tags.has(id))) continue;
    }

    if (rules.subscriptionActive && c.shopperSubscriptions.length === 0) {
      continue;
    }
    if (rules.hasRestockInterest && c.restockSubscribers.length === 0) {
      continue;
    }

    const orderCount = c.orders.length;
    const spend = c.orders.reduce((s, o) => s + o.totalCents, 0);
    const first = c.orders[0]?.createdAt;
    const last = c.orders[c.orders.length - 1]?.createdAt;

    if (rules.minOrders != null && orderCount < rules.minOrders) continue;
    if (rules.maxOrders != null && orderCount > rules.maxOrders) continue;
    if (rules.minSpendCents != null && spend < rules.minSpendCents) continue;
    if (rules.maxSpendCents != null && spend > rules.maxSpendCents) continue;

    if (rules.firstOrderWithinDays != null) {
      if (!first) continue;
      const days = (now - first.getTime()) / dayMs;
      if (days > rules.firstOrderWithinDays) continue;
    }

    if (rules.daysSinceLastOrderMin != null) {
      if (!last) continue;
      const days = (now - last.getTime()) / dayMs;
      if (days < rules.daysSinceLastOrderMin) continue;
    }

    if (rules.daysSinceLastOrderMax != null) {
      if (!last) continue;
      const days = (now - last.getTime()) / dayMs;
      if (days > rules.daysSinceLastOrderMax) continue;
    }

    const purchased = new Set(
      c.orders.flatMap((o) => o.items.map((i) => i.productId)),
    );

    if (rules.productIds?.length) {
      if (!rules.productIds.some((id) => purchased.has(id))) continue;
    }
    if (menuProductIds) {
      let hit = false;
      for (const id of purchased) {
        if (menuProductIds.has(id)) {
          hit = true;
          break;
        }
      }
      if (!hit) continue;
    }
    if (categoryProductIds) {
      let hit = false;
      for (const id of purchased) {
        if (categoryProductIds.has(id)) {
          hit = true;
          break;
        }
      }
      if (!hit) continue;
    }

    matched.push(c.id);
    if (matched.length >= limit) break;
  }

  return matched;
}

export async function countSegmentCustomers(
  ownerId: string,
  rules: SegmentRules,
): Promise<number> {
  const ids = await resolveSegmentCustomerIds(ownerId, rules, 10_000);
  return ids.length;
}

export type CustomerInsight = {
  orderCount: number;
  spendCents: number;
  aovCents: number;
  firstOrderAt: Date | null;
  lastOrderAt: Date | null;
  productNames: string[];
};

export async function loadCustomerInsight(
  ownerId: string,
  customerId: string,
): Promise<CustomerInsight> {
  const orders = await prisma.order.findMany({
    where: {
      ownerId,
      customerId,
      paymentStatus: { in: GROW_ORDER_STATUSES },
    },
    select: {
      totalCents: true,
      createdAt: true,
      items: { select: { productNameSnapshot: true } },
    },
    orderBy: { createdAt: "asc" },
  });
  const spendCents = orders.reduce((s, o) => s + o.totalCents, 0);
  const names = new Set<string>();
  for (const o of orders) {
    for (const i of o.items) names.add(i.productNameSnapshot);
  }
  return {
    orderCount: orders.length,
    spendCents,
    aovCents: orders.length ? Math.round(spendCents / orders.length) : 0,
    firstOrderAt: orders[0]?.createdAt ?? null,
    lastOrderAt: orders[orders.length - 1]?.createdAt ?? null,
    productNames: [...names].slice(0, 12),
  };
}

export function rulesToJson(rules: SegmentRules): Prisma.InputJsonValue {
  return rules as Prisma.InputJsonValue;
}
