import { escapeHtml } from "@/lib/grow/campaign-html";

export const CONTACT_FORM_LAYOUTS = ["stacked", "split"] as const;
export type ContactFormLayout = (typeof CONTACT_FORM_LAYOUTS)[number];

export const CONTACT_LIMITS = { name: 100, email: 200, phone: 40, message: 4000 } as const;
/** Real people take a few seconds to fill the form; bots post instantly. */
export const CONTACT_MIN_FILL_MS = 2500;
/** Honeypot field name. Must not look like anything browser autofill knows (company, website, address…). */
export const CONTACT_TRAP_FIELD = "hp_leave_empty";

export type ContactEnquiry = { name: string; email: string; phone: string; message: string };
export type ContactFormState = { ok: boolean; error?: string };

export function parseContactLayout(raw: unknown): ContactFormLayout {
  return raw === "split" ? "split" : "stacked";
}

function field(formData: FormData, key: string, max: number): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/** Validated enquiry, or the message to show the customer. */
export function parseContactEnquiry(formData: FormData): { ok: true; enquiry: ContactEnquiry } | { ok: false; error: string } {
  const enquiry = {
    name: field(formData, "name", CONTACT_LIMITS.name),
    email: field(formData, "email", CONTACT_LIMITS.email).toLowerCase(),
    phone: field(formData, "phone", CONTACT_LIMITS.phone),
    message: field(formData, "message", CONTACT_LIMITS.message),
  };
  if (!enquiry.name) return { ok: false, error: "Please add your name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enquiry.email)) return { ok: false, error: "Please enter a valid email address." };
  if (enquiry.message.length < 2) return { ok: false, error: "Please write a message." };
  return { ok: true, enquiry };
}

/**
 * Honeypot filled, or the form came back faster than a person could type.
 * No timestamp means the page ran without JavaScript, so only the honeypot applies.
 */
export function looksLikeBot(formData: FormData, now = Date.now()): boolean {
  const trap = formData.get(CONTACT_TRAP_FIELD);
  if (typeof trap === "string" && trap.trim()) return true;
  const raw = formData.get("startedAt");
  if (typeof raw !== "string" || !raw.trim()) return false;
  const started = Number(raw);
  return !Number.isFinite(started) || now - started < CONTACT_MIN_FILL_MS;
}

/** Email to the shop owner; replying goes straight to the customer. */
export function contactEnquiryEmail(input: { shopName: string; pageUrl: string; enquiry: ContactEnquiry }) {
  const { enquiry } = input;
  const pairs: [string, string][] = [
    ["Name", enquiry.name],
    ["Email", enquiry.email],
  ];
  if (enquiry.phone) pairs.push(["Phone", enquiry.phone]);
  const rows = pairs
    .map(([k, v]) => `<tr><td style="padding:2px 12px 2px 0;color:#56684F">${k}</td><td>${escapeHtml(v)}</td></tr>`)
    .join("");
  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#182C1B">
      <p style="margin:0 0 12px">New message from your website contact form.</p>
      <table style="border-collapse:collapse;margin-bottom:16px">${rows}</table>
      <div style="white-space:pre-wrap;border-left:3px solid #2E7D3F;padding:4px 0 4px 12px">${escapeHtml(enquiry.message)}</div>
      <p style="font-size:12px;color:#56684F;margin-top:20px">Reply to this email to answer ${escapeHtml(enquiry.name)} directly.${
        input.pageUrl ? ` Sent from ${escapeHtml(input.pageUrl)}.` : ""
      }</p>
    </div>`;
  return { subject: `New enquiry from ${enquiry.name} - ${input.shopName}`.slice(0, 200), html };
}
