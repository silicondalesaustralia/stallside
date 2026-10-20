"use server";

import { redirect } from "next/navigation";
import type { AudienceType, CommunicationAudience } from "@/contracts/mobile/communication";
import { requireOwnerWrite } from "@/lib/session";
import { countOwnerAudience } from "@/lib/communication/audience";
import { sendOwnerCommunication } from "@/lib/communication/send";

const text = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const all = (fd: FormData, key: string) =>
  fd
    .getAll(key)
    .map((v) => String(v).trim())
    .filter(Boolean);

function audienceFromForm(fd: FormData): CommunicationAudience {
  return {
    audienceType: (text(fd, "audienceType") || "all_marketing") as AudienceType,
    customerId: text(fd, "customerId") || null,
    listId: text(fd, "listId") || null,
    preOrderPageId: text(fd, "preOrderPageId") || null,
    productIds: all(fd, "productId"),
    recipientEmails: all(fd, "recipientEmail"),
  };
}

export async function createAndSendCommunication(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const result = await sendOwnerCommunication(owner.id, {
    ...audienceFromForm(formData),
    subject: text(formData, "subject").slice(0, 200),
    heading: text(formData, "heading").slice(0, 200),
    body: text(formData, "body").slice(0, 8000),
    ctaLabel: text(formData, "ctaLabel").slice(0, 80),
    ctaUrl: text(formData, "ctaUrl").slice(0, 500),
  });
  if ("error" in result) return { error: result.error };
  redirect(`/dashboard/communication/${result.id}`);
}

export async function previewCommunicationAudience(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const result = await countOwnerAudience(owner.id, { ...audienceFromForm(formData), recipientEmails: [] });
  return { count: "error" in result ? 0 : result.count };
}
