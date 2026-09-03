"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { queueCampaignSend } from "@/lib/grow/campaigns";
import { sendOwnerEmail } from "@/lib/notify-email";

function campaignFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Name required");
  const subject = String(formData.get("subject") ?? "").trim();
  if (!subject) throw new Error("Subject required");
  const body = String(formData.get("body") ?? "").trim();
  if (!body) throw new Error("Body required");

  const audienceType = String(formData.get("audienceType") ?? "all_marketing").trim();
  const segmentId = String(formData.get("segmentId") ?? "").trim() || null;
  const menuId = String(formData.get("menuId") ?? "").trim() || null;
  const productId = String(formData.get("productId") ?? "").trim() || null;
  const promotionId = String(formData.get("promotionId") ?? "").trim() || null;
  const templateKey = String(formData.get("templateKey") ?? "").trim() || null;

  let audienceRefId: string | null = null;
  if (audienceType === "menu") audienceRefId = menuId;
  if (audienceType === "product") audienceRefId = productId;

  return {
    name,
    subject,
    heading: String(formData.get("heading") ?? "").trim() || null,
    body,
    ctaLabel: String(formData.get("ctaLabel") ?? "").trim() || null,
    ctaUrl: String(formData.get("ctaUrl") ?? "").trim() || null,
    audienceType,
    segmentId: audienceType === "segment" ? segmentId : null,
    audienceRefId,
    promotionId,
    templateKey,
  };
}

export async function createCampaignDraft(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const data = campaignFields(formData);

  if (data.segmentId) {
    const seg = await prisma.customerSegment.findFirst({
      where: { id: data.segmentId, ownerId: owner.id },
      select: { id: true },
    });
    if (!seg) throw new Error("Segment not found");
  }
  if (data.promotionId) {
    const promo = await prisma.promotion.findFirst({
      where: { id: data.promotionId, ownerId: owner.id },
      select: { id: true },
    });
    if (!promo) throw new Error("Promotion not found");
  }

  const created = await prisma.campaign.create({
    data: { ownerId: owner.id, status: "DRAFT", ...data },
  });

  revalidatePath("/dashboard/campaigns");
  redirect(`/dashboard/campaigns/${created.id}`);
}

export async function queueCampaign(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const id = String(formData.get("id") ?? "");
  await queueCampaignSend(id, owner.id);
  revalidatePath(`/dashboard/campaigns/${id}`);
  revalidatePath("/dashboard/campaigns");
  redirect(`/dashboard/campaigns/${id}?queued=1`);
}

export async function sendCampaignTest(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const id = String(formData.get("id") ?? "");
  const campaign = await prisma.campaign.findFirst({
    where: { id, ownerId: owner.id },
  });
  if (!campaign) throw new Error("Campaign not found");

  const to = owner.contactEmail;
  if (!to) throw new Error("No owner contact email");

  await sendOwnerEmail(
    to,
    `[TEST] ${campaign.subject}`,
    `
    <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#182C1B;max-width:560px">
      <p style="font-size:12px;color:#666"><strong>Test send</strong> — ${owner.businessName}</p>
      ${campaign.heading ? `<h1 style="font-size:22px">${campaign.heading}</h1>` : ""}
      <div>${campaign.body.replace(/\n/g, "<br/>")}</div>
      ${
        campaign.ctaLabel && campaign.ctaUrl
          ? `<p style="margin:24px 0"><a href="${campaign.ctaUrl}">${campaign.ctaLabel}</a></p>`
          : ""
      }
    </div>
    `,
    { kind: "campaign_test" },
  );

  revalidatePath(`/dashboard/campaigns/${id}`);
  redirect(`/dashboard/campaigns/${id}?tested=1`);
}
