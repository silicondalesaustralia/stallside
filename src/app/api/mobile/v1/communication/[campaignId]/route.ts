import type { NextRequest } from "next/server";
import type { CampaignDetailResponse } from "@/contracts/mobile/communication";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { getOwnerCampaign } from "@/lib/communication/load";
import { campaignBodyText, toMobileCampaignRow } from "@/lib/mobile/campaign-dto";
import { mobileError, mobileJson, mobileServerError } from "@/lib/mobile/http";

type Ctx = RouteContext<"/api/mobile/v1/communication/[campaignId]">;

export async function GET(request: NextRequest, ctx: Ctx) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  try {
    const { campaignId } = await ctx.params;
    const campaign = await getOwnerCampaign(guard.value.owner.id, campaignId);
    if (!campaign) return mobileError(404, "Message not found.");
    return mobileJson<CampaignDetailResponse>({
      campaign: toMobileCampaignRow(campaign),
      subject: campaign.subject,
      heading: campaign.heading,
      bodyText: campaignBodyText(campaign.body),
      ctaLabel: campaign.ctaLabel,
      ctaUrl: campaign.ctaUrl,
      recipients: campaign.recipients,
    });
  } catch (error) {
    return mobileServerError("Mobile message failed", error);
  }
}
