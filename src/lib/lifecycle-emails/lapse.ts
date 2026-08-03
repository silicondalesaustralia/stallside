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

/** ~23 days after Pro lapse. */
export async function sendProLapseDay23(r: Recipient) {
  const L = lifecycleLinks();
  const html = emailShell(
    "Still on Free - here's what Pro adds",
    `
      <p>Hi ${greetName(r.name)},</p>
      <p>It&apos;s been a few weeks on <strong>Free</strong> ($0/mo).</p>
      <p><strong>You still have:</strong> every Free feature - cash &amp; PayID
      (Australia only), Tap &amp; Go, pre-orders, branding, restock emails,
      products, stock, QR posters, alerts, and the card-demand counter.</p>
      <p><strong>Pro brings:</strong> no Stallside transaction fee on
      your card, Tap &amp; Go, and pay-later sales. Standard Stripe processing
      fees still apply.</p>
      ${ctaButton(L.billingPro, "See Stallside Pro")}
      <p>Questions? <strong>hello@stallside.app</strong></p>
    `,
  );
  await send(
    r.to,
    `Still on ${APP_NAME} Free - Pro is ready when you are`,
    html,
    "lifecycle_pro_lapse_day23",
  );
}

/** ~45 days after Pro lapse - nudge on fee waiver using Free activity stats. */
export async function sendProLapseDay45(
  r: Recipient,
  stats?: { cardInterestCount?: number; restockCount?: number },
) {
  const L = lifecycleLinks();
  const cardN = stats?.cardInterestCount ?? 0;
  const restockN = stats?.restockCount ?? 0;
  const statsLine =
    cardN > 0 || restockN > 0
      ? `<p>On Free you&apos;ve still got real demand:
         ${cardN > 0 ? `<strong>${cardN}</strong> shoppers tapped “I'd have paid by card”. ` : ""}
         ${restockN > 0 ? `<strong>${restockN}</strong> regulars are on your restock list.` : ""}
         </p>
         <p>Those features work on Free and Pro. <strong>Pro</strong> only changes
         one thing: no Stallside transaction fee on card, Tap &amp; Go, and
         pay-later. Standard Stripe processing fees still apply.</p>`
      : `<p>Free still includes Tap &amp; Go, restock emails, and every other feature.
         <strong>Pro</strong> removes the Stallside card fee (2.5%) so you pay one
         predictable monthly price. Standard Stripe processing fees still apply.</p>`;
  const html = emailShell(
    "Remove the Stallside fee with Pro",
    `
      <p>Hi ${greetName(r.name)},</p>
      <p>A quick check-in from ${APP_NAME}.</p>
      ${statsLine}
      ${ctaButton(L.billingPro, "See Stallside Pro")}
    `,
  );
  await send(
    r.to,
    `Remove the Stallside fee with ${APP_NAME} Pro`,
    html,
    "lifecycle_pro_lapse_day45",
  );
}
