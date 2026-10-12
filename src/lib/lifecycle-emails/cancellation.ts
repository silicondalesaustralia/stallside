import { APP_NAME } from "@/lib/constants";
import {
  TEAM_SIGNATURE,
  ctaButton,
  emailReplyTo,
  emailShell,
  greetName,
} from "@/lib/lifecycle-emails/html";
import { lifecycleLinks } from "@/lib/lifecycle-emails/links";
import { sendOwnerEmail } from "@/lib/notify-email";

export function cancellationFeedbackHtml(name: string): string {
  const L = lifecycleLinks();
  return emailShell(
    `Thanks for trying ${APP_NAME} Pro`,
    `
      <p>Hi ${greetName(name)},</p>
      <p>Sorry to see you leave <strong>${APP_NAME} Pro</strong>. Your account
      stays on <strong>Free ($0/mo)</strong>. Businesses, products, pages, and
      order history stay put. Nothing locks. Every feature still works.</p>
      <p><strong>What changes:</strong> the ${APP_NAME} fee of
      <strong>2.5%</strong> now applies on card, Tap &amp; Go, and pay-later.
      Standard Square or Stripe processing fees still apply on top of that.</p>
      <p>If you've got a minute, telling us what worked, what didn't, or what
      would have kept you on Pro helps us improve:</p>
      ${ctaButton(L.feedback, "Send feedback")}
      ${ctaButton(L.billingPro, "Upgrade to Pro anytime")}
      <p>Upgrade anytime to waive the ${APP_NAME} card fee again.</p>
      ${TEAM_SIGNATURE}
    `,
  );
}

/** Thank-you + feedback after Pro cancel. Owner stays on Free. */
export async function sendCancellationFeedback(input: {
  to: string;
  name?: string | null;
}) {
  await sendOwnerEmail(
    input.to,
    `Thanks for trying ${APP_NAME} Pro`,
    cancellationFeedbackHtml(input.name ?? ""),
    { kind: "cancel_feedback", replyTo: emailReplyTo() },
  );
}
