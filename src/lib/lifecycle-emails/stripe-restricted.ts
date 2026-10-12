import { APP_NAME } from "@/lib/constants";
import { sendOwnerEmail } from "@/lib/notify-email";
import {
  TEAM_SIGNATURE,
  ctaButton,
  emailReplyTo,
  emailShell,
  escapeHtml,
  greetName,
} from "@/lib/lifecycle-emails/html";
import { lifecycleLinks } from "@/lib/lifecycle-emails/links";

type Recipient = { to: string; name: string; missingItems?: string[] };

export const STRIPE_RESTRICTED_SUBJECT = `Finish Stripe setup on ${APP_NAME}`;

const FALLBACK_ITEMS = [
  "Verify your identity",
  "Confirm your address",
  "Add a bank account for payouts",
];

export function stripeRestrictedHtml(
  name: string,
  missingItems: string[],
): string {
  const L = lifecycleLinks();
  const items = (missingItems.length > 0 ? missingItems : FALLBACK_ITEMS)
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

  return emailShell(
    STRIPE_RESTRICTED_SUBJECT,
    `
      <p>Hi ${greetName(name)},</p>
      <p>You started Stripe Connect on ${APP_NAME}, but card payments and
      payouts are paused until Stripe has everything they need.</p>
      <p><strong>Still needed:</strong></p>
      <ul>${items}</ul>
      <p><strong>What to do:</strong></p>
      <ol>
        <li>Open Stripe settings in ${APP_NAME}</li>
        <li>Tap <strong>Continue Stripe setup</strong></li>
        <li>Complete the items above (usually about 10 minutes)</li>
      </ol>
      <p>Once Stripe approves your account, you can take card, Apple Pay,
      Google Pay, Tap &amp; Go, and other payment methods for your region at
      checkout, run pre-orders, and charge subscription boxes.</p>
      ${ctaButton(L.stripe, "Continue Stripe setup")}
      <p>Reply to this email if you get stuck. We'll sort it.</p>
      ${TEAM_SIGNATURE}
    `,
    "Stripe needs one more thing from you.",
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
