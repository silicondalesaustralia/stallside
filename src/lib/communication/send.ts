import { revalidatePath } from "next/cache";
import { communicationInput, type CommunicationInput } from "@/contracts/mobile/communication";
import { prisma } from "@/lib/prisma";
import { queueCampaignSend, resolveCampaignAudience } from "@/lib/grow/campaigns";
import { campaignBodyHasText, sanitizeCampaignHtml } from "@/lib/grow/campaign-html";
import { resolveOwnerAudience } from "./audience";

export type CommunicationSendResult = { ok: true; id: string } | { error: string };

/** Validates, saves and starts sending an email to the chosen audience. Remaining batches are sent by cron. */
export async function sendOwnerCommunication(ownerId: string, raw: CommunicationInput): Promise<CommunicationSendResult> {
  const parsed = communicationInput.safeParse(raw);
  if (!parsed.success) return { error: "Check the message and try again." };
  const input = parsed.data;

  const subject = input.subject.trim();
  const heading = input.heading.trim() || null;
  const body = sanitizeCampaignHtml(input.body.trim());
  const ctaLabelRaw = input.ctaLabel.trim();
  const ctaUrlRaw = input.ctaUrl.trim();
  if (!subject || !campaignBodyHasText(body)) return { error: "Subject and message are required." };
  if (ctaLabelRaw && !ctaUrlRaw) return { error: "Add a button URL, or clear the button label." };
  if (ctaUrlRaw && !ctaLabelRaw) return { error: "Add a button label, or clear the button URL." };

  const audience = await resolveOwnerAudience(ownerId, input);
  if ("error" in audience) return audience;
  const { audienceType, audienceRefId, emailAllowlist } = audience.value;

  const preview = await resolveCampaignAudience({ ownerId, audienceType, audienceRefId, emailAllowlist });
  if (preview.length === 0) {
    return {
      error:
        audienceType === "all_marketing"
          ? "No opted-in marketing contacts yet. Try product buyers or a single customer."
          : "No matching recipients (or they unsubscribed).",
    };
  }

  const campaign = await prisma.campaign.create({
    data: {
      ownerId,
      name: subject.slice(0, 80) || "Message",
      subject,
      heading,
      body,
      ctaLabel: ctaLabelRaw && ctaUrlRaw ? ctaLabelRaw : null,
      ctaUrl: ctaLabelRaw && ctaUrlRaw ? ctaUrlRaw : null,
      audienceType,
      audienceRefId,
      status: "DRAFT",
    },
    select: { id: true },
  });

  await queueCampaignSend(campaign.id, ownerId, { emailAllowlist });

  // Start sending immediately; cron continues any remaining batch.
  const { processCampaignSendBatch } = await import("@/lib/grow/campaign-send");
  for (let i = 0; i < 5; i += 1) {
    const result = await processCampaignSendBatch();
    if (!result.processed || result.finished) break;
  }

  revalidatePath("/dashboard/communication");
  return { ok: true, id: campaign.id };
}
