import { PaymentStatus, Prisma, SubStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  parseSegmentRules,
  type SegmentRules,
} from "@/lib/crm/segment-rules";

export { parseSegmentRules, describeSegmentRules } from "@/lib/crm/segment-rules";
export type { SegmentRules } from "@/lib/crm/segment-rules";

const GROW_ORDER_STATUSES: PaymentStatus[] = [
  PaymentStatus.PAID,
  PaymentStatus.CUSTOMER_CONFIRMED,
  PaymentStatus.DEPOSIT_PAID,
  PaymentStatus.BALANCE_DUE,
  PaymentStatus.BALANCE_FAILED,
];

export type SegmentMember = { customerId: string | null; email: string };

/**
 * Resolve emails for a saved list. Suppressions applied at campaign send time.
 */
export async function resolveSegmentAudience(
  ownerId: string,
  rules: SegmentRules,
  limit = 5000,
): Promise<SegmentMember[]> {
  const byEmail = new Map<string, SegmentMember>();

  const add = (customerId: string | null, emailRaw: string | null | undefined) => {
    const email = (emailRaw ?? "").trim().toLowerCase();
    if (!email || byEmail.has(email)) return;
    byEmail.set(email, { customerId, email });
  };

  if (rules.hasRestockInterest) {
    const subs = await prisma.restockSubscriber.findMany({
      where: {
        status: SubStatus.ACTIVE,
        stand: { ownerId },
      },
      select: {
        email: true,
        customerId: true,
        customer: { select: { id: true, email: true } },
      },
      take: limit * 2,
    });
    for (const s of subs) {
      add(s.customer?.id ?? s.customerId, s.customer?.email ?? s.email);
      if (byEmail.size >= limit) break;
    }
  }

  if (rules.staticCustomerIds?.length) {
    const statics = await prisma.customer.findMany({
      where: {
        ownerId,
        id: { in: rules.staticCustomerIds },
        email: { not: null },
      },
      select: { id: true, email: true, marketingConsent: true },
      take: limit,
    });
    for (const c of statics) {
      if (rules.marketingConsentOnly && !c.marketingConsent) continue;
      add(c.id, c.email);
    }
  }

  const needsOrderRules = Boolean(rules.productIds?.length || rules.preOrderOnly);
  if (needsOrderRules) {
    const since =
      rules.purchasedWithinDays != null
        ? new Date(Date.now() - rules.purchasedWithinDays * 86_400_000)
        : undefined;

    const orders = await prisma.order.findMany({
      where: {
        ownerId,
        paymentStatus: { in: GROW_ORDER_STATUSES },
        ...(rules.preOrderOnly ? { isPreOrder: true } : {}),
        ...(since ? { createdAt: { gte: since } } : {}),
        ...(rules.productIds?.length
          ? { items: { some: { productId: { in: rules.productIds } } } }
          : {}),
        OR: [
          { customer: { email: { not: null } } },
          { receiptEmail: { not: null } },
        ],
      },
      select: {
        customerId: true,
        receiptEmail: true,
        customer: {
          select: { id: true, email: true, marketingConsent: true },
        },
      },
      take: limit * 3,
    });

    for (const o of orders) {
      if (rules.marketingConsentOnly && o.customer && !o.customer.marketingConsent) {
        continue;
      }
      const email = o.customer?.email ?? o.receiptEmail;
      add(o.customer?.id ?? o.customerId, email);
      if (byEmail.size >= limit) break;
    }
  }

  if (rules.requireEmail) {
    // already email-only
  }

  return [...byEmail.values()].slice(0, limit);
}

export async function countSegmentAudience(
  ownerId: string,
  rules: SegmentRules,
): Promise<number> {
  const members = await resolveSegmentAudience(ownerId, rules, 10_000);
  return members.length;
}

export function rulesToJson(rules: SegmentRules): Prisma.InputJsonValue {
  return rules as Prisma.InputJsonValue;
}
