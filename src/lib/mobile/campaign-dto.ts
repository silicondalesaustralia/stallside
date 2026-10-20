import type { Campaign } from "@/generated/prisma/client";
import type { MobileCampaignRow } from "@/contracts/mobile/communication";

export function toMobileCampaignRow(c: Campaign): MobileCampaignRow {
  return {
    id: c.id,
    name: c.name,
    status: c.status,
    sentCount: c.sentCount,
    failedCount: c.failedCount,
    recipientCount: c.recipientCount,
    audience: c.audienceType.replaceAll("_", " "),
    createdAt: c.createdAt.toISOString(),
  };
}

/** Stored body is sanitised HTML (or legacy plain text); the app shows it as text. */
export function campaignBodyText(body: string): string {
  return body
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li)>/gi, "\n")
    .replace(/<li>/gi, "• ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
