import { APP_NAME } from "@/lib/constants";
import { appBaseUrl } from "@/lib/app-url";
import {
  emailReplyTo,
  emailShell,
  greetName,
} from "@/lib/lifecycle-emails/html";
import { sendOwnerEmail } from "@/lib/notify-email";

/** Thank-you + feedback ask after cancel or account delete. */
export async function sendCancellationFeedback(input: {
  to: string;
  name?: string | null;
}) {
  const feedbackUrl = `${appBaseUrl()}/contact?subject=feedback`;
  const title = `Thanks for being with ${APP_NAME}`;
  const html = emailShell(
    title,
    `
      <p>Hi ${greetName(input.name ?? "")},</p>
      <p>Thanks for being a ${APP_NAME} subscriber — we&apos;re sorry to see you go.</p>
      <p>To help us improve, we&apos;d appreciate any feedback you may have about what
      worked, what didn&apos;t, or what would have made you stay.</p>
      <p>Just reply to this email, or share a note here:</p>
      <p style="margin:24px 0">
        <a href="${feedbackUrl}"
           style="background:#2E7D3F;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:600;display:inline-block">
          Send feedback
        </a>
      </p>
      <p>You&apos;re always welcome back if you need Stallside again.</p>
    `,
  );

  await sendOwnerEmail(input.to, title, html, {
    kind: "cancel_feedback",
    replyTo: emailReplyTo(),
  });
}
