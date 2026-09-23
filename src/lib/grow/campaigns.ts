import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import {
  CAMPAIGN_MAX_RECIPIENTS,
  resolveCampaignAudience,
} from "@/lib/grow/campaign-audience";

export { CAMPAIGN_MAX_RECIPIENTS, resolveCampaignAudience };
export const CAMPAIGN_SEND_BATCH = 40;

export function newClickToken(): string {
  return crypto.randomBytes(18).toString("hex");
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
