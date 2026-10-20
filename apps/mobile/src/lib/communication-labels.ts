import type {
  AudienceType,
  MobileCampaignRow,
} from "@contracts/mobile/communication";

export const AUDIENCE_OPTIONS = [
  { value: "all_marketing", label: "Everyone opted in" },
  { value: "list", label: "Saved list" },
  { value: "preorder_page", label: "Pre-order buyers" },
  { value: "product", label: "Product buyers" },
  { value: "customer", label: "One customer" },
] as const satisfies readonly { value: AudienceType; label: string }[];

export function campaignMeta(c: MobileCampaignRow): string {
  const failed = c.failedCount ? ` · ${c.failedCount} failed` : "";
  return `${c.sentCount}/${c.recipientCount} sent${failed} · ${c.audience}`;
}

export function campaignStatus(c: MobileCampaignRow): string {
  return c.status.charAt(0) + c.status.slice(1).toLowerCase();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Plain text from the app's message box as email HTML: blank lines start paragraphs, single newlines break lines. */
export function textToHtml(text: string): string {
  return text
    .trim()
    .split(/\n\s*\n/)
    .map((para) => `<p>${escapeHtml(para.trim()).replace(/\n/g, "<br/>")}</p>`)
    .join("");
}
