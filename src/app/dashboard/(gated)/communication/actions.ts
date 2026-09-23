"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  resolveCampaignAudience,
  queueCampaignSend,
} from "@/lib/grow/campaigns";
import {
  campaignBodyHasText,
  sanitizeCampaignHtml,
} from "@/lib/grow/campaign-html";

export async function createAndSendCommunication(formData: FormData) {
  const { owner } = await requireOwnerWrite();

  const audienceType = String(formData.get("audienceType") ?? "all_marketing").trim();
  const customerId = String(formData.get("customerId") ?? "").trim() || null;
  const listId = String(formData.get("listId") ?? "").trim() || null;
  const preOrderPageId =
    String(formData.get("preOrderPageId") ?? "").trim() || null;
  const productIds = formData
    .getAll("productId")
    .map((v) => String(v).trim())
    .filter(Boolean);
  const subject = String(formData.get("subject") ?? "").trim().slice(0, 200);
  const heading = String(formData.get("heading") ?? "").trim().slice(0, 200) || null;
  const bodyRaw = String(formData.get("body") ?? "").trim().slice(0, 8000);
  const body = sanitizeCampaignHtml(bodyRaw);
  const ctaLabelRaw = String(formData.get("ctaLabel") ?? "").trim().slice(0, 80);
  const ctaUrlRaw = String(formData.get("ctaUrl") ?? "").trim().slice(0, 500);
  const ctaLabel = ctaLabelRaw && ctaUrlRaw ? ctaLabelRaw : null;
  const ctaUrl = ctaLabelRaw && ctaUrlRaw ? ctaUrlRaw : null;
  const name =
    String(formData.get("name") ?? "").trim().slice(0, 120) ||
    subject.slice(0, 80) ||
    "Message";

  if (!subject || !campaignBodyHasText(body)) {
    return { error: "Subject and message are required." };
  }
  if (ctaLabelRaw && !ctaUrlRaw) {
    return { error: "Add a button URL, or clear the button label." };
  }
  if (ctaUrlRaw && !ctaLabelRaw) {
    return { error: "Add a button label, or clear the button URL." };
  }
  if (!["all_marketing", "product", "customer", "list", "preorder_page"].includes(audienceType)) {
    return { error: "Choose who to email." };
  }

  let audienceRefId: string | null = null;
  if (audienceType === "customer") {
    if (!customerId) return { error: "Choose a customer." };
    const c = await prisma.customer.findFirst({
      where: { id: customerId, ownerId: owner.id },
      select: { id: true },
    });
    if (!c) return { error: "Customer not found." };
    audienceRefId = c.id;
  }
  if (audienceType === "list") {
    if (!listId) return { error: "Choose a list." };
    const list = await prisma.customerSegment.findFirst({
      where: { id: listId, ownerId: owner.id, isActive: true },
      select: { id: true },
    });
    if (!list) return { error: "List not found." };
    audienceRefId = list.id;
  }
  if (audienceType === "preorder_page") {
    if (!preOrderPageId) return { error: "Choose a pre-order page." };
    const page = await prisma.preOrderPage.findFirst({
      where: { id: preOrderPageId, ownerId: owner.id },
      select: { id: true },
    });
    if (!page) return { error: "Pre-order page not found." };
    audienceRefId = page.id;
  }
  if (audienceType === "product") {
    if (productIds.length === 0) return { error: "Choose at least one product." };
    const owned = await prisma.product.findMany({
      where: { ownerId: owner.id, id: { in: productIds } },
      select: { id: true },
    });
    if (owned.length === 0) return { error: "Product not found." };
    audienceRefId = owned.map((p) => p.id).join(",");
  }

  const emailAllowlist =
    audienceType === "list"
      ? formData
          .getAll("recipientEmail")
          .map((v) => String(v).trim().toLowerCase())
          .filter((e) => e.includes("@"))
      : null;
  if (audienceType === "list" && (!emailAllowlist || emailAllowlist.length === 0)) {
    return { error: "Select at least one email on the list." };
  }

  const preview = await resolveCampaignAudience({
    ownerId: owner.id,
    audienceType,
    audienceRefId,
    emailAllowlist,
  });
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
      ownerId: owner.id,
      name,
      subject,
      heading,
      body,
      ctaLabel,
      ctaUrl,
      audienceType,
      audienceRefId,
      status: "DRAFT",
    },
  });

  await queueCampaignSend(campaign.id, owner.id, { emailAllowlist });

  // Start sending immediately; cron continues any remaining batch.
  const { processCampaignSendBatch } = await import(
    "@/lib/grow/campaign-send"
  );
  for (let i = 0; i < 5; i += 1) {
    const result = await processCampaignSendBatch();
    if (!result.processed || result.finished) break;
  }

  revalidatePath("/dashboard/communication");
  redirect(`/dashboard/communication/${campaign.id}`);
}

export async function previewCommunicationAudience(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const audienceType = String(formData.get("audienceType") ?? "all_marketing").trim();
  const customerId = String(formData.get("customerId") ?? "").trim() || null;
  const listId = String(formData.get("listId") ?? "").trim() || null;
  const preOrderPageId =
    String(formData.get("preOrderPageId") ?? "").trim() || null;
  const productIds = formData
    .getAll("productId")
    .map((v) => String(v).trim())
    .filter(Boolean);

  let audienceRefId: string | null = null;
  if (audienceType === "customer") audienceRefId = customerId;
  if (audienceType === "list") audienceRefId = listId;
  if (audienceType === "preorder_page") audienceRefId = preOrderPageId;
  if (audienceType === "product") audienceRefId = productIds.join(",") || null;

  const audience = await resolveCampaignAudience({
    ownerId: owner.id,
    audienceType,
    audienceRefId,
  });
  return { count: audience.length };
}
