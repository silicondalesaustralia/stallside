import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import {
  parseSegmentRules,
  resolveSegmentCustomerIds,
} from "@/lib/grow/segments";
import {
  isMarketingSuppressed,
  signUnsubLink,
} from "@/lib/grow/consent";
import { sendOwnerEmail } from "@/lib/notify-email";
import { appBaseUrl } from "@/lib/app-url";

export const CAMPAIGN_ATTRIBUTION_DAYS = 14;
export const CAMPAIGN_SEND_BATCH = 40;
export const CAMPAIGN_MAX_RECIPIENTS = 500;

export function newClickToken(): string {
  return crypto.randomBytes(18).toString("hex");
}

export async function resolveCampaignAudience(input: {
  ownerId: string;
  audienceType: string;
  segmentId?: string | null;
  audienceRefId?: string | null;
}): Promise<{ customerId: string | null; email: string }[]> {
  const out: { customerId: string | null; email: string }[] = [];

  if (input.audienceType === "segment" && input.segmentId) {
    const segment = await prisma.customerSegment.findFirst({
      where: { id: input.segmentId, ownerId: input.ownerId },
    });
    if (!segment) return [];
    const ids = await resolveSegmentCustomerIds(
      input.ownerId,
      parseSegmentRules(segment.rules),
      CAMPAIGN_MAX_RECIPIENTS,
    );
    const customers = await prisma.customer.findMany({
      where: { ownerId: input.ownerId, id: { in: ids } },
      select: { id: true, email: true, marketingConsent: true },
    });
    for (const c of customers) {
      if (!c.email || !c.marketingConsent) continue;
      out.push({ customerId: c.id, email: c.email });
    }
  } else if (input.audienceType === "product" && input.audienceRefId) {
    const orders = await prisma.order.findMany({
      where: {
        ownerId: input.ownerId,
        items: { some: { productId: input.audienceRefId } },
        customer: { marketingConsent: true, email: { not: null } },
      },
      select: { customerId: true, customer: { select: { email: true } } },
      take: CAMPAIGN_MAX_RECIPIENTS,
    });
    const seen = new Set<string>();
    for (const o of orders) {
      const email = o.customer?.email;
      if (!email || seen.has(email)) continue;
      seen.add(email);
      out.push({ customerId: o.customerId, email });
    }
  } else if (input.audienceType === "menu" && input.audienceRefId) {
    const productIds = (
      await prisma.menuProduct.findMany({
        where: {
          menuId: input.audienceRefId,
          menu: { ownerId: input.ownerId },
        },
        select: { productId: true },
      })
    ).map((p) => p.productId);
    if (productIds.length === 0) return [];
    const orders = await prisma.order.findMany({
      where: {
        ownerId: input.ownerId,
        items: { some: { productId: { in: productIds } } },
        customer: { marketingConsent: true, email: { not: null } },
      },
      select: { customerId: true, customer: { select: { email: true } } },
      take: CAMPAIGN_MAX_RECIPIENTS,
    });
    const seen = new Set<string>();
    for (const o of orders) {
      const email = o.customer?.email;
      if (!email || seen.has(email)) continue;
      seen.add(email);
      out.push({ customerId: o.customerId, email });
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

  // Deduplicate by email + drop suppressed
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
    segmentId: campaign.segmentId,
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

export async function processCampaignSendBatch(limit = CAMPAIGN_SEND_BATCH) {
  const campaign = await prisma.campaign.findFirst({
    where: { status: "SENDING" },
    orderBy: { updatedAt: "asc" },
    include: {
      owner: { select: { businessName: true, contactEmail: true } },
      promotion: { select: { code: true } },
    },
  });
  if (!campaign) return { processed: 0 };

  const pending = await prisma.campaignRecipient.findMany({
    where: { campaignId: campaign.id, status: "PENDING" },
    take: limit,
  });

  if (pending.length === 0) {
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: { status: "SENT", sentAt: new Date() },
    });
    return { processed: 0, finished: true };
  }

  const base = appBaseUrl();
  let sent = 0;
  let failed = 0;

  for (const row of pending) {
    if (await isMarketingSuppressed(campaign.ownerId, row.email)) {
      await prisma.campaignRecipient.update({
        where: { id: row.id },
        data: { status: "SKIPPED", errorMessage: "suppressed" },
      });
      continue;
    }

    const click = await prisma.campaignClick.create({
      data: {
        campaignId: campaign.id,
        token: newClickToken(),
        email: row.email,
      },
    });

    const trackUrl = `${base}/c/${click.token}`;
    const ctaHref = campaign.ctaUrl
      ? `${trackUrl}?to=${encodeURIComponent(campaign.ctaUrl)}`
      : trackUrl;
    const unsub = `${base}/unsubscribe/marketing?t=${signUnsubLink(campaign.ownerId, row.email)}`;
    const promoLine = campaign.promotion?.code
      ? `<p><strong>Use code ${campaign.promotion.code}</strong></p>`
      : "";

    try {
      await sendOwnerEmail(
        row.email,
        campaign.subject,
        `
        <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#182C1B;max-width:560px">
          <p style="font-size:12px;color:#666">${campaign.owner.businessName}</p>
          ${campaign.heading ? `<h1 style="font-size:22px">${campaign.heading}</h1>` : ""}
          <div>${campaign.body.replace(/\n/g, "<br/>")}</div>
          ${promoLine}
          ${
            campaign.ctaLabel
              ? `<p style="margin:24px 0"><a href="${ctaHref}" style="background:#2e7d3f;color:#fff;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:600">${campaign.ctaLabel}</a></p>`
              : `<p><a href="${ctaHref}">View offer</a></p>`
          }
          <hr style="border:none;border-top:1px solid #ddd;margin:28px 0"/>
          <p style="font-size:12px;color:#666">
            You're receiving this because you shopped with ${campaign.owner.businessName} or opted in.
            <a href="${unsub}">Unsubscribe</a>
          </p>
        </div>
        `,
        {
          kind: "campaign",
          headers: {
            "List-Unsubscribe": `<${unsub}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
        },
      );
      await prisma.campaignRecipient.update({
        where: { id: row.id },
        data: { status: "SENT", sentAt: new Date() },
      });
      sent += 1;
    } catch (err) {
      await prisma.campaignRecipient.update({
        where: { id: row.id },
        data: {
          status: "FAILED",
          errorMessage: err instanceof Error ? err.message : "send failed",
        },
      });
      failed += 1;
    }
  }

  await prisma.campaign.update({
    where: { id: campaign.id },
    data: {
      sentCount: { increment: sent },
      failedCount: { increment: failed },
    },
  });

  const remaining = await prisma.campaignRecipient.count({
    where: { campaignId: campaign.id, status: "PENDING" },
  });
  if (remaining === 0) {
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: { status: "SENT", sentAt: new Date() },
    });
  }

  return { processed: pending.length, sent, failed };
}

export async function attributeOrderToCampaign(input: {
  orderId: string;
  ownerId: string;
  clickToken?: string | null;
  totalCents: number;
}) {
  if (!input.clickToken) return;
  const click = await prisma.campaignClick.findUnique({
    where: { token: input.clickToken },
    include: { campaign: { select: { id: true, ownerId: true, sentAt: true } } },
  });
  if (!click || click.campaign.ownerId !== input.ownerId) return;
  if (click.orderId) return;

  const windowStart = Date.now() - CAMPAIGN_ATTRIBUTION_DAYS * 86_400_000;
  if (click.clickedAt.getTime() < windowStart) return;

  await prisma.$transaction([
    prisma.campaignClick.update({
      where: { id: click.id },
      data: { orderId: input.orderId },
    }),
    prisma.order.update({
      where: { id: input.orderId },
      data: { campaignId: click.campaignId },
    }),
    prisma.campaign.update({
      where: { id: click.campaignId },
      data: {
        attributedOrders: { increment: 1 },
        attributedRevenueCents: { increment: input.totalCents },
        clickCount: { increment: 0 },
      },
    }),
  ]);
}
