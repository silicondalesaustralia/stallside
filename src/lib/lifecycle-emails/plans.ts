import { APP_NAME } from "@/lib/constants";
import { sendOwnerEmail } from "@/lib/notify-email";
import {
  TEAM_SIGNATURE,
  ctaButton,
  emailReplyTo,
  emailShell,
  greetName,
  textLink,
} from "@/lib/lifecycle-emails/html";
import { SKOOL_COMMUNITY_LINE } from "@/lib/lifecycle-emails/skool-community";
import { lifecycleLinks } from "@/lib/lifecycle-emails/links";

type Recipient = { to: string; name: string };

export const PRO_WELCOME_SUBJECT = `You're on ${APP_NAME} Pro`;

export function proWelcomeHtml(name: string): string {
  const L = lifecycleLinks();
  return emailShell(
    PRO_WELCOME_SUBJECT,
    `
      <p>Hi ${greetName(name)},</p>
      <p>Welcome to <strong>${APP_NAME} Pro</strong>. Every feature we've built,
      plus <strong>no ${APP_NAME} transaction fee</strong> on card, Tap &amp; Go,
      or pay-later. Standard Square or Stripe processing fees still apply, and
      those are the same for everyone.</p>
      <p><strong>To start taking payments:</strong></p>
      <ol>
        <li>Connect ${textLink(L.square, "Square")} (AU) or ${textLink(L.stripe, "Stripe")}</li>
        <li>Finish the onboarding so charges are enabled</li>
        <li>Turn on the payment methods you want under your business settings</li>
        <li>Share your pre-order link, or print your stall QR</li>
      </ol>
      ${ctaButton(L.stripe, "Open payment settings")}
      <p>Guides: ${textLink(L.customerPayments, "Customer payments")} ·
      ${textLink(L.billingGuide, "Billing")}</p>
      <p>Anything odd during setup? Reply to this email.</p>
      ${SKOOL_COMMUNITY_LINE}
      ${TEAM_SIGNATURE}
    `,
    `No ${APP_NAME} transaction fees. Let's set up payments.`,
  );
}

/** Paid Vendl Pro welcome (DB field still cardWelcomeSentAt). */
export async function sendCardWelcome(r: Recipient) {
  await sendOwnerEmail(r.to, PRO_WELCOME_SUBJECT, proWelcomeHtml(r.name), {
    replyTo: emailReplyTo(),
    kind: "lifecycle_card_welcome",
  });
}
