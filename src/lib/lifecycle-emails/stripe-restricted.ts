import { APP_NAME } from "@/lib/constants";
import { sendOwnerEmail } from "@/lib/notify-email";
import {
  ctaButton,
  emailReplyTo,
  emailShell,
  greetName,
} from "@/lib/lifecycle-emails/html";
import { lifecycleLinks } from "@/lib/lifecycle-emails/links";
import { STRIPE_CHECKOUT_METHODS_PHRASE } from "@/lib/stripe-connect-copy";

type Recipient = { to: string; name: string; missingItems?: string[] };

export const STRIPE_RESTRICTED_SUBJECT = `Finish Stripe setup on ${APP_NAME}`;

export function stripeRestrictedHtml(
  name: string,
  missingItems: string[],
): string {
  const L = lifecycleLinks();
  const items =
    missingItems.length > 0
      ? `<ul>${missingItems.map((item) => `<li>${item}</li>`).join("")}</ul>`
      : `<ul>
          <li>Verify your identity</li>
          <li>Confirm your address</li>
          <li>Add a bank account for payouts</li>
        </ul>`;

  return emailShell(
    STRIPE_RESTRICTED_SUBJECT,
    `
      <p>Hi ${greetName(name)},</p>
      <p>You started Stripe Connect on ${APP_NAME}, but card payments and
      payouts are still paused until Stripe has everything they need.</p>
      <p><strong>Still needed:</strong></p>
      ${items}
      <p><strong>What to do:</strong></p>
      <ol>
        <li>Open Stripe settings in ${APP_NAME}</li>
        <li>Tap <strong>Continue Stripe setup</strong></li>
        <li>Complete the items above (usually about 10 minutes)</li>
      </ol>
      <p>Once Stripe approves your account, you can take ${STRIPE_CHECKOUT_METHODS_PHRASE}
      at checkout, run pre-orders, and charge subscription boxes.</p>
      ${ctaButton(L.stripe, "Continue Stripe setup")}
      <p>Reply to this email if you get stuck. We can help.</p>
    `,
  );
}

/** Owner started Connect but charges are not enabled yet. */
export async function sendStripeRestrictedNudge(r: Recipient) {
  await sendOwnerEmail(
    r.to,
    STRIPE_RESTRICTED_SUBJECT,
    stripeRestrictedHtml(r.name, r.missingItems ?? []),
    { replyTo: emailReplyTo(), kind: "lifecycle_stripe_restricted" },
  );
}
