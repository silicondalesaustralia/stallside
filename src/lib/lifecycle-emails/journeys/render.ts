import { appBaseUrl } from "@/lib/app-url";
import { ctaButton, emailShell, escapeHtml, greetName } from "@/lib/lifecycle-emails/html";
import type { Block, JourneyEmail } from "./types";

const FEE_EXAMPLE: Record<string, { sales: string; saving: string }> = {
  AUD: { sales: "A$1,000", saving: "A$25" },
  USD: { sales: "$1,000", saving: "$25" },
  GBP: { sales: "£1,000", saving: "£25" },
  EUR: { sales: "€1,000", saving: "€25" },
};

const SIGNATURE = "<p>Jono<br>Co-Founder, Vendl</p>";

export type RenderInput = { name: string; currency: string; dfyLive: boolean };

function inline(text: string, input: RenderInput): string {
  const fee = FEE_EXAMPLE[input.currency.toUpperCase()] ?? FEE_EXAMPLE.USD;
  return escapeHtml(text)
    .replaceAll("{name}", greetName(input.name))
    .replaceAll("{fee_sales}", escapeHtml(fee.sales))
    .replaceAll("{fee_saving}", escapeHtml(fee.saving))
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

export function ctaHref(path: string): string {
  return /^https?:\/\//.test(path) ? path : `${appBaseUrl()}${path}`;
}

function renderBlock(block: Block, email: JourneyEmail, input: RenderInput): string {
  if (typeof block === "string") return `<p>${inline(block, input)}</p>`;
  if ("button" in block) return email.cta ? ctaButton(ctaHref(email.cta.path), email.cta.label) : "";
  if ("dfy" in block) return input.dfyLive ? block.dfy.map((b) => renderBlock(b, email, input)).join("") : "";
  const tag = block.ordered ? "ol" : "ul";
  const items = block.list.map((item) => `<li style="margin:4px 0">${inline(item, input)}</li>`).join("");
  return `<${tag} style="padding-left:20px">${items}</${tag}>`;
}

/** Full HTML for a journey email, inside the lifecycle shell (unsubscribe footer included). */
export function renderJourneyEmail(email: JourneyEmail, input: RenderInput): string {
  const body = email.body.map((block) => renderBlock(block, email, input)).join("\n");
  return emailShell(email.subject, `${body}\n${SIGNATURE}`);
}
