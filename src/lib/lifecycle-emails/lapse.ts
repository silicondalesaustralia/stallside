import { APP_DOMAIN, APP_NAME } from "@/lib/constants";
import { sendOwnerEmail } from "@/lib/notify-email";
import {
  TEAM_SIGNATURE,
  ctaButton,
  emailReplyTo,
  emailShell,
  greetName,
} from "@/lib/lifecycle-emails/html";
import { SKOOL_COMMUNITY_LINE } from "@/lib/lifecycle-emails/skool-community";
import { lifecycleLinks } from "@/lib/lifecycle-emails/links";

type Recipient = { to: string; name: string; businessName?: string };

async function send(to: string, subject: string, html: string, kind: string) {
  await sendOwnerEmail(to, subject, html, { replyTo: emailReplyTo(), kind });
}

/** ~23 days after Pro lapse. */
export async function sendProLapseDay23(r: Recipient) {
  const L = lifecycleLinks();
  const subject = `Still on ${APP_NAME} Free? Pro is ready when you are`;
  const html = emailShell(
    subject,
    `
      <p>Hi ${greetName(r.name)},</p>
      <p>It's been a few weeks on <strong>Free</strong> ($0/mo).</p>
      <p><strong>You still have:</strong> stall checkout, pre-orders, cart
      upsells and add-ons, make lists, payments, branding, and alerts.</p>
      <p><strong>Pro brings:</strong> no ${APP_NAME} transaction fee on card,
      Tap &amp; Go, and pay-later. Standard Square or Stripe processing fees
      still apply.</p>
      ${ctaButton(L.billingPro, `See ${APP_NAME} Pro`)}
      <p>Questions? <strong>hello@${APP_DOMAIN}</strong></p>
      ${SKOOL_COMMUNITY_LINE}
      ${TEAM_SIGNATURE}
    `,
  );
  await send(r.to, subject, html, "lifecycle_pro_lapse_day23");
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
      ? `<p>On Free you've still got real demand:
         ${cardN > 0 ? `<strong>${cardN}</strong> customers wanted card. ` : ""}
         ${restockN > 0 ? `<strong>${restockN}</strong> are on your restock list.` : ""}
         </p>
         <p>Those features work on Free and Pro. <strong>Pro</strong> only
         removes the ${APP_NAME} fee on card, Tap &amp; Go, and pay-later.
         Standard Square or Stripe processing fees still apply.</p>`
      : `<p>Free still includes stall checkout, pre-orders, cart upsells, and
         every other feature. <strong>Pro</strong> removes the ${APP_NAME} card
         fee (2.5%). Standard Square or Stripe processing fees still apply.</p>`;
  const subject = `Remove the ${APP_NAME} fee with ${APP_NAME} Pro`;
  const html = emailShell(
    subject,
    `
      <p>Hi ${greetName(r.name)},</p>
      <p>A quick check-in from ${APP_NAME}.</p>
      ${statsLine}
      ${ctaButton(L.billingPro, `See ${APP_NAME} Pro`)}
      ${SKOOL_COMMUNITY_LINE}
      ${TEAM_SIGNATURE}
    `,
  );
  await send(r.to, subject, html, "lifecycle_pro_lapse_day45");
}
