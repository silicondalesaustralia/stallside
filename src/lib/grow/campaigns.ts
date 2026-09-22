import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { isMarketingSuppressed } from "@/lib/grow/consent";
import {
  parseSegmentRules,
  resolveSegmentAudience,
} from "@/lib/crm/segments";

export const CAMPAIGN_SEND_BATCH = 40;
export const CAMPAIGN_MAX_RECIPIENTS = 500;

export function newClickToken(): string {
  return crypto.randomBytes(18).toString("hex");
}

export async function resolveCampaignAudience(input: {
  ownerId: string;
  audienceType: string;
  audienceRefId?: string | null;
  /** When set, only these emails (already on the audience) are kept. */
  emailAllowlist?: string[] | null;
}): Promise<{ customerId: string | null; email: string }[]> {
  const out: { customerId: string | null; email: string }[] = [];

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
      const members = await resolveSegmentAudience(
        input.ownerId,
        parseSegmentRules(list.rules),
        CAMPAIGN_MAX_RECIPIENTS,
      );
      out.push(...members);
    }
  } else if (input.audienceType === "product" && input.audienceRefId) {
    const productIds = input.audienceRefId
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
    if (productIds.length === 0) return [];
    const orders = await prisma.order.findMany({
      where: {
        ownerId: input.ownerId,
        items: { some: { productId: { in: productIds } } },
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
    const seen = new Set<string>();
    for (const o of orders) {
      const email = (o.customer?.email ?? o.receiptEmail ?? "")
        .trim()
        .toLowerCase();
      if (!email || seen.has(email)) continue;
      seen.add(email);
      out.push({ customerId: o.customer?.id ?? o.customerId, email });
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
          input.emailAllowlist.map((e) => e.trim().toLowerCase()).filter(Boolean),
        )
      : null;

  const dedup = new Map<string, { customerId: string | null; email: string }>();
  for (const row of out) {
    const email = row.email.trim().toLowerCase();
    if (!email || dedup.has(email)) continue;
    if (allow && !allow.has(email)) continue;
    if (await isMarketingSuppressed(input.ownerId, email)) continue;
    dedup.set(email, { customerId: row.customerId, email });
  }
  return [...dedup.values()].slice(0, CAMPAIGN_MAX_RECIPIENTS);
}

export async function queueCampaignSend(
  campaignId: string,
  ownerId: string,
  opts?: { emailAllowlist?: string[] | null },
) {
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, ownerId },
  });
  if (!campaign) throw new Error("Campaign not found");
  if (campaign.status !== "DRAFT" && campaign.status !== "FAILED") {
    throw new Error("Campaign cannot be sent in this status");
  }

  const audience = await resolveCampaignAudience({
    ownerId,
    audienceType: campaign.audienceType,
    audienceRefId: campaign.audienceRefId,
    emailAllowlist: opts?.emailAllowlist,
  });

  await prisma.$transaction(async (tx) => {
    await tx.campaignRecipient.deleteMany({ where: { campaignId } });
    if (audience.length > 0) {
      await tx.campaignRecipient.createMany({
        data: audience.map((a) => ({
          campaignId,
          customerId: a.customerId,
          email: a.email,
          status: "PENDING" as const,
        })),
      });
    }
    await tx.campaign.update({
      where: { id: campaignId },
      data: {
        status: "SENDING",
        recipientCount: audience.length,
        sentCount: 0,
        failedCount: 0,
      },
    });
  });
}
