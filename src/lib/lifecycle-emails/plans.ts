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

/** Paid Stallside Pro welcome (DB field still cardWelcomeSentAt). */
export async function sendCardWelcome(r: Recipient) {
  const L = lifecycleLinks();
  const html = emailShell(
    `You're on ${APP_NAME} Pro`,
    `
      <p>Hi ${greetName(r.name)},</p>
      <p>Welcome to <strong>${APP_NAME} Pro</strong>. Same features as Free - and
      <strong>no Stallside transaction fee</strong> on card, Tap &amp; Go, or
      pay-later. Standard Stripe processing fees still apply.</p>
      <p>If Tap &amp; Go isn&apos;t live yet:</p>
      <ol>
        <li><a href="${L.stripe}">Connect Stripe</a> (finish onboarding so charges are enabled)</li>
        <li>Turn Card / Tap &amp; Go on for each stand under My stands</li>
        <li>Confirm your QR is posted, then do a small test checkout</li>
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
