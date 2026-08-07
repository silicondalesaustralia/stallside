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

/** Welcome email for new Free owners. */
export async function sendTrialWelcome(r: Recipient) {
  const L = lifecycleLinks();
  const html = emailShell(
    `Welcome to ${APP_NAME}`,
    `
      <p>Hi ${greetName(r.name)},</p>
      <p>Thanks for joining ${APP_NAME}. Glad you&apos;re here.</p>
      <p><strong>Free is $0/mo with every feature</strong> - cash, PayID (Australia only),
      Tap &amp; Go, pre-orders, branding, restock emails, and more. Vendl fee is
      2.5% on card, Tap &amp; Go, and pay-later; cash and PayID stay free.
      Standard Stripe processing fees apply separately. Upgrade to Pro anytime to
      remove the Vendl fee.</p>
      <p><strong>Start here</strong></p>
      <ol>
        <li>Create your first stand</li>
        <li>Add a product and stock</li>
        <li>Print your QR sign</li>
        <li>Connect Stripe if you want Tap &amp; Go</li>
      </ol>
      ${ctaButton(L.newStand, "Create your first stand")}
      <p><a href="${L.billing}">See Pro pricing</a> · <a href="${L.knowledge}">Guides</a></p>
    `,
  );
  await send(r.to, `Welcome to ${APP_NAME} - let’s get your stand live`, html, "lifecycle_welcome");
}
