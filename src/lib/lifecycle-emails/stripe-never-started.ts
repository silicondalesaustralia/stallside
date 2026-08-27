import { APP_NAME } from "@/lib/constants";
import { sendOwnerEmail } from "@/lib/notify-email";
import {
  ctaButton,
  emailReplyTo,
  emailShell,
  greetName,
} from "@/lib/lifecycle-emails/html";
import { lifecycleLinks } from "@/lib/lifecycle-emails/links";
import {
  CASH_AND_LOCAL_PAYMENTS_LABEL,
  CASH_AND_LOCAL_PAYMENTS_PHRASE,
  STRIPE_CHECKOUT_METHODS_PHRASE,
} from "@/lib/stripe-connect-copy";

type Recipient = { to: string; name: string };

export const STRIPE_NEVER_STARTED_SUBJECT = `Optional: take card payments with ${APP_NAME}`;

export function stripeNeverStartedHtml(name: string): string {
  const L = lifecycleLinks();
  return emailShell(
    STRIPE_NEVER_STARTED_SUBJECT,
    `
      <p>Hi ${greetName(name)},</p>
      <p>Your business is set up on ${APP_NAME}. ${CASH_AND_LOCAL_PAYMENTS_LABEL}
      already work if you have those turned on.</p>
      <p>If you&apos;d like <strong>${STRIPE_CHECKOUT_METHODS_PHRASE}</strong>,
      connect Stripe when you&apos;re ready. It takes about 10 minutes:</p>
      <ol>
        <li>Open Stripe settings</li>
        <li>Verify your identity</li>
        <li>Add a bank account for payouts</li>
        <li>Turn on card payments on your checkout</li>
      </ol>
      <p><strong>No rush.</strong> Skip this if ${CASH_AND_LOCAL_PAYMENTS_PHRASE} are all you need.</p>
      ${ctaButton(L.stripe, "Connect Stripe (optional)")}
      <p>Stripe is required for <strong>pre-orders and subscription boxes</strong>.
      Connect first if you plan to use those.</p>
    `,
  );
}

/** Business is live but Stripe was never connected. */
export async function sendStripeNeverStartedNudge(r: Recipient) {
  await sendOwnerEmail(
    r.to,
    STRIPE_NEVER_STARTED_SUBJECT,
    stripeNeverStartedHtml(r.name),
    { replyTo: emailReplyTo(), kind: "lifecycle_stripe_never_started" },
  );
}
