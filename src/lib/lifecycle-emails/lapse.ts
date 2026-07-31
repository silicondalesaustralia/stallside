import { APP_NAME } from "@/lib/constants";
import { sendOwnerEmail } from "@/lib/notify-email";
import {
  ctaButton,
  emailReplyTo,
  emailShell,
  escapeHtml,
  greetName,
} from "@/lib/lifecycle-emails/html";
import { lifecycleLinks } from "@/lib/lifecycle-emails/links";

type Recipient = { to: string; name: string; businessName?: string };

async function send(to: string, subject: string, html: string, kind: string) {
  await sendOwnerEmail(to, subject, html, { replyTo: emailReplyTo(), kind });
}

/** Immediate: paid Pro ended → Starter. */
export async function sendProLapseDay0(r: Recipient) {
  const L = lifecycleLinks();
  const name = escapeHtml(r.businessName?.trim() || r.name.trim() || "there");
  const html = emailShell(
    "You're on Starter now",
    `
      <p>Hi ${name},</p>
      <p>Your <strong>${APP_NAME} Pro</strong> access has ended.
      <strong>You're on Starter now. Nothing's lost.</strong></p>
      <p>Your stands, products, QR posters, and orders are still here. Cash and PayID
      (Australia only) keep working. Tap &amp; Go, new pre-orders, branding, and
      restock notify are paused until you upgrade.</p>
      <p>You can still fulfil paid pre-orders in Collections.</p>
      ${ctaButton(L.billingPro, "Upgrade to Pro")}
      <p>Questions? <strong>hello@stallside.app</strong></p>
    `,
  );
  await send(
    r.to,
    `You're on ${APP_NAME} Starter - nothing's lost`,
    html,
    "lifecycle_pro_lapse_day0",
  );
}

/** ~23 days after Pro lapse. */
export async function sendProLapseDay23(r: Recipient) {
  const L = lifecycleLinks();
  const html = emailShell(
    "Still on Starter - here's what Pro adds back",
    `
      <p>Hi ${greetName(r.name)},</p>
      <p>It&apos;s been a few weeks on <strong>Starter</strong> (free forever).</p>
      <p><strong>You still have:</strong> cash &amp; PayID (Australia only), products
      and options, stock, QR posters, alerts, and the card-demand counter.</p>
      <p><strong>Pro brings back:</strong> Tap &amp; Go, pre-orders, branding, and
      sending restock emails to the regulars already on your list.</p>
      ${ctaButton(L.billingPro, "See Stallside Pro")}
      <p>Questions? <strong>hello@stallside.app</strong></p>
    `,
  );
  await send(
    r.to,
    `Still on ${APP_NAME} Starter - Pro is ready when you are`,
    html,
    "lifecycle_pro_lapse_day23",
  );
}

/** ~45 days after Pro lapse - card-demand / restock stats. */
export async function sendProLapseDay45(
  r: Recipient,
  stats?: { cardInterestCount?: number; restockCount?: number },
) {
  const L = lifecycleLinks();
  const cardN = stats?.cardInterestCount ?? 0;
  const restockN = stats?.restockCount ?? 0;
  const statsLine =
    cardN > 0 || restockN > 0
      ? `<p>Since Pro ended:
         ${cardN > 0 ? `<strong>${cardN}</strong> shoppers tapped “I'd have paid by card”. ` : ""}
         ${restockN > 0 ? `<strong>${restockN}</strong> regulars are waiting on your restock list.` : ""}
         </p>`
      : `<p>Shoppers on Starter can still tell you they wanted card, and join your restock
         list - Pro is how you take the card and send the email.</p>`;
  const html = emailShell(
    "What Pro would have done",
    `
      <p>Hi ${greetName(r.name)},</p>
      <p>A quick check-in from ${APP_NAME}.</p>
      ${statsLine}
      ${ctaButton(L.billingPro, "See Stallside Pro")}
    `,
  );
  await send(
    r.to,
    `What ${APP_NAME} Pro would have done`,
    html,
    "lifecycle_pro_lapse_day45",
  );
}
