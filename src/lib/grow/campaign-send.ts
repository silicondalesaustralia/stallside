import { prisma } from "@/lib/prisma";
import {
  isMarketingSuppressed,
  signUnsubLink,
} from "@/lib/grow/consent";
import { sendOwnerEmail } from "@/lib/notify-email";
import { appBaseUrl } from "@/lib/app-url";
import {
  CAMPAIGN_SEND_BATCH,
  newClickToken,
} from "@/lib/grow/campaigns";

export async function processCampaignSendBatch(limit = CAMPAIGN_SEND_BATCH) {
  const campaign = await prisma.campaign.findFirst({
    where: { status: "SENDING" },
    orderBy: { updatedAt: "asc" },
    include: {
      owner: { select: { businessName: true, contactEmail: true } },
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
    return { processed: 0, finished: true as const };
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

    try {
      await sendOwnerEmail(
        row.email,
        campaign.subject,
        `
        <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#182C1B;max-width:560px">
          <p style="font-size:12px;color:#666">${campaign.owner.businessName}</p>
          ${campaign.heading ? `<h1 style="font-size:22px">${campaign.heading}</h1>` : ""}
          <div>${campaign.body.replace(/\n/g, "<br/>")}</div>
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
