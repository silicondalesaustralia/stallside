import { APP_NAME } from "@/lib/constants";
import { sendOwnerEmail } from "@/lib/notify-email";
import {
  ctaButton,
  ctaButtonRow,
  emailReplyTo,
  emailShell,
  greetName,
} from "@/lib/lifecycle-emails/html";
import { lifecycleLinks } from "@/lib/lifecycle-emails/links";

type Recipient = { to: string; name: string; businessName?: string };

export function trialWelcomeHtml(name: string): string {
  const L = lifecycleLinks();
  return emailShell(
    `Welcome to ${APP_NAME}`,
    `
      <p>Hi ${greetName(name)},</p>
      <p>Thanks for joining ${APP_NAME}.</p>
      <p><strong>Free includes every feature</strong> - stall checkout,
      pre-orders, subscriptions, cart upsells, payments, branding, and more.</p>
      <p><strong>Start here:</strong></p>
      <p><strong>Checkout at your location</strong></p>
      <ol>
        <li>Create your first business</li>
        <li>Add what you sell</li>
        <li>Share your link, or print a QR for customers</li>
        <li>Connect Stripe if you want card payments (optional for cash)</li>
      </ol>
      ${ctaButton(L.newStand, "Create your first stand")}
      <p><strong>Pre-orders or subscriptions</strong></p>
      <ol>
        <li>Create a business and add products (if you have not already)</li>
        <li>Connect Stripe - card is required</li>
        <li>Create a pre-order page, or a subscription box</li>
        <li>Share the link or QR</li>
      </ol>
      ${ctaButtonRow([
        { href: L.newPreOrder, label: "New pre-order page" },
        { href: L.newSubscription, label: "New subscription" },
      ])}
      <p>We build fast and ship fast. If you hit an issue, have a request,
      or want a new feature, reply to this email or
      <a href="${L.featureRequest}">tell us</a> and we will work on it
      ASAP.</p>
      <p><a href="${L.firstStand}">First stand</a> ·
      <a href="${L.knowledgePreOrder}">Pre-order pages</a> ·
      <a href="${L.knowledgeSubscriptions}">Subscriptions</a></p>
    `,
  );
}

async function send(to: string, subject: string, html: string, kind: string) {
  await sendOwnerEmail(to, subject, html, { replyTo: emailReplyTo(), kind });
}

/** Welcome email for new Free owners (stall + pre-orders + subscriptions). */
export async function sendTrialWelcome(r: Recipient) {
  await send(
    r.to,
    `Welcome to ${APP_NAME} - let’s get you live`,
    trialWelcomeHtml(r.name),
    "lifecycle_welcome",
  );
}
