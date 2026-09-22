import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import {
  isMarketingSuppressed,
  signUnsubLink,
} from "@/lib/grow/consent";
import { sendOwnerEmail } from "@/lib/notify-email";
import { appBaseUrl } from "@/lib/app-url";

export const CAMPAIGN_SEND_BATCH = 40;
export const CAMPAIGN_MAX_RECIPIENTS = 500;

export function newClickToken(): string {
  return crypto.randomBytes(18).toString("hex");
}

export async function resolveCampaignAudience(input: {
  ownerId: string;
  audienceType: string;
  audienceRefId?: string | null;
}): Promise<{ customerId: string | null; email: string }[]> {
  const out: { customerId: string | null; email: string }[] = [];

  if (input.audienceType === "customer" && input.audienceRefId) {
    const c = await prisma.customer.findFirst({
      where: { id: input.audienceRefId, ownerId: input.ownerId },
      select: { id: true, email: true },
    });
    if (c?.email) out.push({ customerId: c.id, email: c.email });
  } else if (input.audienceType === "product" && input.audienceRefId) {
    const orders = await prisma.order.findMany({
      where: {
        ownerId: input.ownerId,
        items: { some: { productId: input.audienceRefId } },
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

  const dedup = new Map<string, { customerId: string | null; email: string }>();
  for (const row of out) {
    const email = row.email.trim().toLowerCase();
    if (!email || dedup.has(email)) continue;
    if (await isMarketingSuppressed(input.ownerId, email)) continue;
    dedup.set(email, { customerId: row.customerId, email });
  }
  return [...dedup.values()].slice(0, CAMPAIGN_MAX_RECIPIENTS);
}

export async function queueCampaignSend(campaignId: string, ownerId: string) {
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
