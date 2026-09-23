import { prisma } from "@/lib/prisma";
import { isMarketingSuppressed } from "@/lib/grow/consent";
import {
  parseSegmentRules,
  resolveSegmentAudience,
} from "@/lib/crm/segments";
import type { Prisma } from "@/generated/prisma/client";

export const CAMPAIGN_MAX_RECIPIENTS = 500;

type Member = { customerId: string | null; email: string };

async function emailsFromOrders(
  ownerId: string,
  extra: Prisma.OrderWhereInput,
): Promise<Member[]> {
  const orders = await prisma.order.findMany({
    where: {
      ownerId,
      ...extra,
      OR: [
        { customer: { email: { not: null } } },
        { receiptEmail: { not: null } },
      ],
    },
    select: {
      customerId: true,
      receiptEmail: true,
      customer: { select: { id: true, email: true } },
    },
    take: CAMPAIGN_MAX_RECIPIENTS * 3,
  });
  const out: Member[] = [];
  const seen = new Set<string>();
  for (const o of orders) {
    const email = (o.customer?.email ?? o.receiptEmail ?? "")
      .trim()
      .toLowerCase();
    if (!email || seen.has(email)) continue;
    seen.add(email);
    out.push({ customerId: o.customer?.id ?? o.customerId, email });
  }
  return out;
}

export async function resolveCampaignAudience(input: {
  ownerId: string;
  audienceType: string;
  audienceRefId?: string | null;
  emailAllowlist?: string[] | null;
}): Promise<Member[]> {
  const out: Member[] = [];

  if (input.audienceType === "customer" && input.audienceRefId) {
    const c = await prisma.customer.findFirst({
      where: { id: input.audienceRefId, ownerId: input.ownerId },
      select: { id: true, email: true },
    });
    if (c?.email) out.push({ customerId: c.id, email: c.email });
  } else if (input.audienceType === "list" && input.audienceRefId) {
    const list = await prisma.customerSegment.findFirst({
      where: {
        id: input.audienceRefId,
        ownerId: input.ownerId,
        isActive: true,
      },
      select: { rules: true },
    });
    if (list) {
      out.push(
        ...(await resolveSegmentAudience(
          input.ownerId,
          parseSegmentRules(list.rules),
          CAMPAIGN_MAX_RECIPIENTS,
        )),
      );
    }
  } else if (input.audienceType === "preorder_page" && input.audienceRefId) {
    const page = await prisma.preOrderPage.findFirst({
      where: { id: input.audienceRefId, ownerId: input.ownerId },
      select: {
        collectionAt: true,
        items: { select: { productId: true } },
      },
    });
    const productIds = page?.items.map((i) => i.productId) ?? [];
    if (page && productIds.length > 0) {
      out.push(
        ...(await emailsFromOrders(input.ownerId, {
          isPreOrder: true,
          collectionAt: page.collectionAt,
          items: { some: { productId: { in: productIds } } },
        })),
      );
    }
  } else if (input.audienceType === "product" && input.audienceRefId) {
    const productIds = input.audienceRefId
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
    if (productIds.length > 0) {
      out.push(
        ...(await emailsFromOrders(input.ownerId, {
          items: { some: { productId: { in: productIds } } },
        })),
      );
    }
  } else if (input.audienceType === "all_marketing") {
    const customers = await prisma.customer.findMany({
      where: {
        ownerId: input.ownerId,
        marketingConsent: true,
        email: { not: null },
      },
      select: { id: true, email: true },
      take: CAMPAIGN_MAX_RECIPIENTS,
    });
    for (const c of customers) {
      if (!c.email) continue;
      out.push({ customerId: c.id, email: c.email });
    }
  }

  const allow =
    input.emailAllowlist && input.emailAllowlist.length > 0
      ? new Set(
          input.emailAllowlist
            .map((e) => e.trim().toLowerCase())
            .filter(Boolean),
        )
      : null;

  const dedup = new Map<string, Member>();
  for (const row of out) {
    const email = row.email.trim().toLowerCase();
    if (!email || dedup.has(email)) continue;
    if (allow && !allow.has(email)) continue;
    if (await isMarketingSuppressed(input.ownerId, email)) continue;
    dedup.set(email, { customerId: row.customerId, email });
  }
  return [...dedup.values()].slice(0, CAMPAIGN_MAX_RECIPIENTS);
}
