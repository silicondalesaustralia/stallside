import { APP_NAME } from "@/lib/constants";
import { appBaseUrl } from "@/lib/app-url";
import {
  ctaButton,
  emailReplyTo,
  emailShell,
  greetName,
} from "@/lib/lifecycle-emails/html";
import { lifecycleLinks } from "@/lib/lifecycle-emails/links";
import { sendOwnerEmail } from "@/lib/notify-email";

/** Thank-you + feedback after Pro cancel. Owner keeps Starter. */
export async function sendCancellationFeedback(input: {
  to: string;
  name?: string | null;
}) {
  const L = lifecycleLinks();
  const feedbackUrl = `${appBaseUrl()}/contact?subject=feedback`;
  const title = `Thanks for trying ${APP_NAME} Pro`;
  const html = emailShell(
    title,
    `
      <p>Hi ${greetName(input.name ?? "")},</p>
      <p>Sorry to see you leave <strong>${APP_NAME} Pro</strong>. Your account stays on
      <strong>Starter free forever</strong> — stands, products, QR posters, and order
      history remain. Nothing locks.</p>
      <p>If you have a minute, what worked, what didn&apos;t, or what would have made
      you stay helps us improve:</p>
      <p style="margin:24px 0">
        <a href="${feedbackUrl}"
           style="background:#2E7D3F;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:600;display:inline-block">
          Send feedback
        </a>
      </p>
      ${ctaButton(L.billingPro, "Upgrade to Pro anytime")}
      <p>You&apos;re always welcome back on Pro if you need Tap &amp; Go again.</p>
    `,
  );

  await sendOwnerEmail(input.to, title, html, {
    kind: "cancel_feedback",
    replyTo: emailReplyTo(),
  });
}
