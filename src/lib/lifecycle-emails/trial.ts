import { APP_NAME } from "@/lib/constants";
import { sendOwnerEmail } from "@/lib/notify-email";
import {
  ctaButton,
  emailReplyTo,
  emailShell,
  greetName,
} from "@/lib/lifecycle-emails/html";
import { lifecycleLinks } from "@/lib/lifecycle-emails/links";

type Recipient = { to: string; name: string; businessName?: string };

async function send(to: string, subject: string, html: string, kind: string) {
  await sendOwnerEmail(to, subject, html, { replyTo: emailReplyTo(), kind });
}

/** Welcome email for new Free owners (stall + pre-orders). */
export async function sendTrialWelcome(r: Recipient) {
  const L = lifecycleLinks();
  const html = emailShell(
    `Welcome to ${APP_NAME}`,
    `
      <p>Hi ${greetName(r.name)},</p>
      <p>Thanks for joining ${APP_NAME}.</p>
      <p><strong>Free includes every feature</strong> - stall checkout,
      pre-orders, cart upsells, payments, branding, and more.</p>
      <p><strong>Start here</strong></p>
      <ol>
        <li>Create your first business</li>
        <li>Add what you sell</li>
        <li>Share your link, or print a QR for the stall</li>
        <li>Connect Stripe if you want card payments</li>
      </ol>
      ${ctaButton(L.newStand, "Get started")}
      <p><a href="${L.knowledge}">Guides</a></p>
    `,
  );
  await send(
    r.to,
    `Welcome to ${APP_NAME} - let’s get you live`,
    html,
    "lifecycle_welcome",
  );
}
