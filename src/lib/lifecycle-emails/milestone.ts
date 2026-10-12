import { APP_NAME } from "@/lib/constants";
import { sendOwnerEmail } from "@/lib/notify-email";
import {
  JONO_REPLY_TO,
  JONO_SIGNATURE,
  ctaButton,
  emailShell,
  greetName,
  jonoFrom,
} from "@/lib/lifecycle-emails/html";
import { lifecycleLinks } from "@/lib/lifecycle-emails/links";

export const TEN_ORDERS_SUBJECT = `Congrats on 10 orders with ${APP_NAME}`;

export function firstTenOrdersHtml(name: string): string {
  const L = lifecycleLinks();
  return emailShell(
    TEN_ORDERS_SUBJECT,
    `
      <p>Hi ${greetName(name)},</p>
      <p><strong>10 orders.</strong> That's past testing. People are paying you.
      Nice work.</p>
      <p>If you're up for it, send me a photo of your setup and I'll add it to
      our <strong>user gallery</strong>. It helps other producers see what's
      possible, and it puts your shop in front of people looking for exactly
      what you make.</p>
      ${ctaButton(L.gallerySubmit, "Share a photo")}
      <p>You'll need a photo, a name, and a location (town or region is fine,
      no street address required).</p>
      <p>Reply to this email if you want to tell me how it's going. I read
      everything.</p>
      ${JONO_SIGNATURE}
    `,
    "Past testing. People are paying.",
  );
}

export async function sendFirstTenOrdersEmail(input: {
  to: string;
  name: string;
}) {
  await sendOwnerEmail(input.to, TEN_ORDERS_SUBJECT, firstTenOrdersHtml(input.name), {
    from: jonoFrom(),
    replyTo: JONO_REPLY_TO,
    kind: "lifecycle_ten_orders",
  });
}
