import { escapeHtml } from "@/lib/lifecycle-emails/html";

/** A seller's message to someone who left a review; replies go to the seller's email. */
export function emailReviewerHtml(businessName: string, message: string): string {
  const paragraphs = message
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
  return `${paragraphs}<p style="color:#666">— ${escapeHtml(businessName)}</p>
    <p style="color:#999;font-size:12px">You're receiving this because you left a review for ${escapeHtml(businessName)}. Reply to this email to answer them directly.</p>`;
}
