import type Stripe from "stripe";
import { APP_NAME } from "@/lib/constants";
import { appBaseUrl } from "@/lib/app-url";
import { escapeHtml } from "@/lib/lifecycle-emails/html";
import { formatMoney } from "@/lib/money";
import { contactInbox, sendOwnerEmail } from "@/lib/notify-email";
import { prisma } from "@/lib/prisma";
import { DFY_BUILD_PURPOSE, DFY_BUILD_TITLE } from "./dfy-build";

const WRAP = 'style="font-family:system-ui,sans-serif;line-height:1.5;color:#182C1B"';

/** Webhook: email the Vendl team and the owner once a done-for-you build is paid. Returns true when handled. */
export async function handleDfyBuildPaid(session: Stripe.Checkout.Session): Promise<boolean> {
  if (session.metadata?.purpose !== DFY_BUILD_PURPOSE) return false;
  if (session.payment_status !== "paid") return true;
  const ownerId = session.metadata.ownerId;
  const owner = ownerId
    ? await prisma.owner.findUnique({
        where: { id: ownerId },
        select: { businessName: true, contactEmail: true, user: { select: { email: true } } },
      })
    : null;
  if (!owner) {
    console.error(`[${APP_NAME}] Done-for-you build paid for unknown owner`, { ownerId, session: session.id });
    return true;
  }

  const email = owner.contactEmail?.trim() || owner.user.email;
  const domain = session.metadata.domain?.trim() || "No domain yet";
  const paid = formatMoney(session.amount_total ?? 0, (session.currency ?? "usd").toUpperCase());
  const adminUrl = `${appBaseUrl()}/admin/owners/${ownerId}`;

  await sendOwnerEmail(
    contactInbox(),
    `[${APP_NAME}] ${DFY_BUILD_TITLE} booked · ${owner.businessName}`,
    `<div ${WRAP}>
      <p style="font-size:18px;font-weight:600">${DFY_BUILD_TITLE} booked</p>
      <p><strong>Business:</strong> ${escapeHtml(owner.businessName)} (${escapeHtml(email)})</p>
      <p><strong>Domain:</strong> ${escapeHtml(domain)}</p>
      <p><strong>Paid:</strong> ${escapeHtml(paid)}</p>
      <p><a href="${adminUrl}">Open owner in admin</a></p>
    </div>`,
    { replyTo: email.includes("@") ? email : undefined, kind: "admin_dfy_build" },
  ).catch((error) => console.error(`[${APP_NAME}] Done-for-you admin email failed`, error));

  await sendOwnerEmail(
    email,
    `Your ${APP_NAME} website build is booked`,
    `<div ${WRAP}>
      <p style="font-size:18px;font-weight:600">Thanks, ${escapeHtml(owner.businessName)}!</p>
      <p>We've received your payment of ${escapeHtml(paid)} for a ${DFY_BUILD_TITLE.toLowerCase()}.</p>
      <p>We'll be in touch within 2 business days to gather your details and get started.</p>
    </div>`,
    { kind: "dfy_build_receipt" },
  ).catch((error) => console.error(`[${APP_NAME}] Done-for-you owner email failed`, error));
  return true;
}
