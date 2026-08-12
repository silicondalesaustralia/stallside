import { APP_DOMAIN, APP_NAME } from "@/lib/constants";
import { sendOwnerEmail } from "@/lib/notify-email";
import {
  ctaButton,
  emailReplyTo,
  emailShell,
  greetName,
} from "@/lib/lifecycle-emails/html";
import { lifecycleLinks } from "@/lib/lifecycle-emails/links";

type Recipient = { to: string; name: string };

async function send(to: string, subject: string, html: string, kind: string) {
  await sendOwnerEmail(to, subject, html, { replyTo: emailReplyTo(), kind });
}

/** Paid Vendl Pro welcome (DB field still cardWelcomeSentAt). */
export async function sendCardWelcome(r: Recipient) {
  const L = lifecycleLinks();
  const html = emailShell(
    `You're on ${APP_NAME} Pro`,
    `
      <p>Hi ${greetName(r.name)},</p>
      <p>Welcome to <strong>${APP_NAME} Pro</strong>. Same features as Free -
      stall checkout, pre-orders, cart upsells, and the rest - with
      <strong>no Vendl transaction fee</strong> on card, Tap &amp; Go, or
      pay-later. Standard Stripe processing fees still apply.</p>
      <p>To take card payments:</p>
      <ol>
        <li><a href="${L.stripe}">Connect Stripe</a> (finish onboarding so charges are enabled)</li>
        <li>Turn on the payments you want under My Businesses</li>
        <li>Share your pre-order link, or post your stall QR</li>
        <li>Place a small test order</li>
      </ol>
      ${ctaButton(L.stripe, "Open Stripe settings")}
      <p>Guides: <a href="${L.customerPayments}">Customer payments</a> ·
      <a href="${L.billingGuide}">Billing</a></p>
      <p>Missing a payment type your customers use?
      <a href="${L.featureRequest}">Request a feature</a>.</p>
      <p>Anything odd in setup? <strong>hello@${APP_DOMAIN}</strong>.</p>
    `,
  );
  await send(
    r.to,
    `You're on ${APP_NAME} Pro`,
    html,
    "lifecycle_card_welcome",
  );
}
