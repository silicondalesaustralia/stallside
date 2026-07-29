import { APP_NAME } from "@/lib/constants";
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
      <p><strong>10 orders.</strong> That&apos;s past the &ldquo;just testing&rdquo; stage -
      your stand is doing real work. Nice one.</p>
      <p>We love seeing ${APP_NAME} out in the wild. If you&apos;re happy to share, upload a
      photo of your stand and we&apos;ll consider featuring it in our <strong>user gallery</strong>.</p>
      ${ctaButton(L.gallerySubmit, "Share your stand")}
      <p>You&apos;ll need a photo of the stand, a stand name, and a location (town / region
      is enough - no street address required).</p>
      <p>Questions? <strong>hello@stallside.app</strong></p>
    `,
  );
  await sendOwnerEmail(
    input.to,
    `Congrats - 10 orders on ${APP_NAME}`,
    html,
    { replyTo: emailReplyTo(), kind: "lifecycle_ten_orders" },
  );
}
