"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sendOwnerEmail } from "@/lib/notify-email";
import { parseStorefrontConfig } from "@/lib/storefront/config";
import { RateLimitError, assertRateLimit, clientIpFromHeaders } from "@/lib/rate-limit";
import { contactEnquiryEmail, looksLikeBot, parseContactEnquiry, type ContactFormState } from "./contact-form";

const SENT: ContactFormState = { ok: true };

async function recipientFor(standId: string) {
  const stand = await prisma.stand.findUnique({
    where: { id: standId },
    select: {
      isActive: true,
      name: true,
      owner: {
        select: {
          deletedAt: true,
          businessName: true,
          contactEmail: true,
          user: { select: { email: true } },
          storefront: { select: { contactEmail: true, headline: true, draftConfig: true } },
        },
      },
    },
  });
  if (!stand?.isActive || stand.owner.deletedAt) return null;
  const { owner } = stand;
  // Where messages go isn't a design change, so the latest saved address applies before publishing.
  const savedEmail = owner.storefront ? parseStorefrontConfig(owner.storefront.draftConfig).identity?.contactEmail : undefined;
  const siteEmail = savedEmail !== undefined ? savedEmail : owner.storefront?.contactEmail;
  const email = siteEmail?.trim() || owner.contactEmail?.trim() || owner.user.email;
  if (!email) return null;
  return { email, shopName: owner.storefront?.headline?.trim() || owner.businessName || stand.name };
}

/** Website contact form: emails the shop owner with Reply-To set to the customer. */
export async function sendContactEnquiry(_prev: ContactFormState, formData: FormData): Promise<ContactFormState> {
  // Bots get the same "sent" answer so they don't learn to dodge the checks.
  if (looksLikeBot(formData)) {
    console.warn("[contact form] treated as bot, not sent", { standId: String(formData.get("standId") ?? "") });
    return SENT;
  }
  const parsed = parseContactEnquiry(formData);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const standId = String(formData.get("standId") ?? "").trim();
  if (!standId) return { ok: false, error: "This form isn't set up yet." };

  try {
    const ip = await clientIpFromHeaders();
    await assertRateLimit({ bucket: `contact:${standId}:${ip}`, limit: 5, windowMs: 15 * 60_000 });
    const to = await recipientFor(standId);
    if (!to) return { ok: false, error: "This shop isn't taking messages right now." };
    const pageUrl = (await headers()).get("referer")?.slice(0, 300) ?? "";
    const { subject, html } = contactEnquiryEmail({ shopName: to.shopName, pageUrl, enquiry: parsed.enquiry });
    await sendOwnerEmail(to.email, subject, html, { replyTo: parsed.enquiry.email, kind: "contact_enquiry" });
    return SENT;
  } catch (err) {
    if (err instanceof RateLimitError) return { ok: false, error: "You've sent a few messages already. Please try again later." };
    console.error("[contact form] send failed", err);
    return { ok: false, error: "Sorry, your message didn't send. Please try again." };
  }
}
