import { APP_NAME } from "@/lib/constants";
import { sendOwnerEmail } from "@/lib/notify-email";
import {
  TEAM_SIGNATURE,
  ctaButtonRow,
  emailReplyTo,
  emailShell,
  greetName,
} from "@/lib/lifecycle-emails/html";
import { lifecycleLinks } from "@/lib/lifecycle-emails/links";

type Recipient = { to: string; name: string };

export const STRIPE_NEVER_STARTED_SUBJECT = `Optional: take card payments with ${APP_NAME}`;

export function stripeNeverStartedHtml(name: string): string {
  const L = lifecycleLinks();
  return emailShell(
    STRIPE_NEVER_STARTED_SUBJECT,
    `
      <p>Hi ${greetName(name)},</p>
      <p>Your shop is set up on ${APP_NAME}. Cash and bank payments already work
      if you've turned those on.</p>
      <p>If you want card, Apple Pay, Google Pay, or Tap &amp; Go at checkout,
      you've got two options:</p>
      <p><strong>Already using Square?</strong> Connect it in one tap. Your
      products and inventory sync automatically.</p>
      <p><strong>Prefer Stripe?</strong> Takes about 10 minutes: verify your
      identity, add a bank account for payouts, turn on card payments.</p>
      ${ctaButtonRow([
        { href: L.square, label: "Connect Square" },
        { href: L.stripe, label: "Connect Stripe" },
      ])}
      <p><strong>No rush.</strong> Skip this if cash and bank payments cover
      what you need.</p>
      <p>One thing worth flagging: card payments via Square or Stripe are
      required for <strong>pre-orders and subscription boxes</strong>. Connect
      first if you plan to use those.</p>
      ${TEAM_SIGNATURE}
    `,
    "Square, Stripe, or just cash. Your call.",
  );
}

/** Business is live but neither Stripe nor Square was ever connected. */
export async function sendStripeNeverStartedNudge(r: Recipient) {
  await sendOwnerEmail(
    r.to,
    STRIPE_NEVER_STARTED_SUBJECT,
    stripeNeverStartedHtml(r.name),
    { replyTo: emailReplyTo(), kind: "lifecycle_stripe_never_started" },
  );
}
