import { APP_DOMAIN, APP_NAME } from "@/lib/constants";
import { sendOwnerEmail } from "@/lib/notify-email";
import {
  ctaButton,
  emailReplyTo,
  emailShell,
  greetName,
} from "@/lib/lifecycle-emails/html";
import { lifecycleLinks } from "@/lib/lifecycle-emails/links";

export async function sendFirstTenOrdersEmail(input: {
  to: string;
  name: string;
}) {
  const L = lifecycleLinks();
  const html = emailShell(
    "Congrats - 10 orders",
    `
      <p>Hi ${greetName(input.name)},</p>
      <p><strong>10 orders.</strong> That&apos;s past testing - people are paying.
      Nice one.</p>
      <p>If you&apos;re happy to share, send a photo of your stall or collection
      setup and we&apos;ll consider featuring it in the <strong>user gallery</strong>.</p>
      ${ctaButton(L.gallerySubmit, "Share a photo")}
      <p>You&apos;ll need a photo, a name, and a location (town / region is
      enough - no street address required).</p>
      <p>Questions? <strong>hello@${APP_DOMAIN}</strong></p>
    `,
  );
  await sendOwnerEmail(
    input.to,
    `Congrats - 10 orders on ${APP_NAME}`,
    html,
    { replyTo: emailReplyTo(), kind: "lifecycle_ten_orders" },
  );
}
