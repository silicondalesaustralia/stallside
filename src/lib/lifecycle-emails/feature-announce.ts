import { APP_NAME } from "@/lib/constants";
import { sendOwnerEmail } from "@/lib/notify-email";
import {
  ctaButton,
  emailReplyTo,
  emailShell,
  greetName,
} from "@/lib/lifecycle-emails/html";
import { lifecycleLinks } from "@/lib/lifecycle-emails/links";

type Recipient = { to: string; name: string };

export const FEATURE_ANNOUNCE_SUBJECT =
  "[NEW FEATURES] @ Stallside: Pricing Model Change & More Features Added";

export function featureAnnounceHtml(name: string): string {
  const L = lifecycleLinks();
  return emailShell(
    FEATURE_ANNOUNCE_SUBJECT,
    `
      <p>Hi ${greetName(name)},</p>
      <p>Quick update from ${APP_NAME}: plans are simpler, checkout got stronger,
      and a few tools that used to sound “Pro only” are on Free for everyone.</p>

      <p><strong>Plans (the important bit)</strong></p>
      <p><strong>Free</strong> is $0/mo with <strong>every feature</strong>: cash,
      PayID (Australia), Tap &amp; Go (card, Apple Pay, Google Pay), Buy Now Pay
      Later on larger orders (Afterpay, Zip, Klarna), pre-orders and Collections,
      stand branding and social links, restock notify emails, product options,
      hide/archive/duplicate, and the card-demand counter.</p>
      <p>On Free, Stallside takes <strong>2.5% + 30¢</strong> on card, Tap &amp; Go,
      and pay-later on all transactions. Cash and PayID stay free. In
      <a href="${L.stripe}">Settings → Card / Tap &amp; Go</a> you choose whether to
      <strong>absorb that fee</strong> or <strong>pass it on</strong> as a clear
      card fee line at checkout. Stallside still receives the fee either way -
      you're only choosing who pays it.</p>
      <p><strong>Stallside Pro</strong> is the same product with
      <strong>no Stallside card fee</strong> - keep 100% of card, Tap &amp; Go, and
      pay-later sales (Stripe's own processing fees still apply). From A$19.99 /
      US$14.99 / £11.99 / €14.99 per site / month.</p>
      <p>There is no separate trial: Free already includes every feature. Upgrade to
      Pro anytime if you want the Stallside fee waived.
      <a href="${L.billing}">Settings → Billing</a>.</p>

      <p><strong>Also live</strong></p>
      <ul>
        <li><strong>Buy Now, Pay Later</strong> - Afterpay, Zip, and Klarna show
        automatically on larger orders at Stripe Checkout (where Stripe supports
        them). No extra toggle.</li>
        <li><strong>Pre-orders</strong> - pay by card to reserve for a collection
        day; track Ready → Collected; Email all for a day.</li>
        <li><strong>Stand branding</strong> - logo, colours, and social links on
        the stall and QR poster (Free and Pro).</li>
        <li><strong>Restock list</strong> - customers opt in after checkout; you
        hit Notify customers and Stallside emails them (Free and Pro). You never
        see their addresses.</li>
        <li><strong>Card-demand counter</strong> - when Tap &amp; Go isn't on yet,
        shoppers can tap “I'd have paid by card” so you see demand on the
        dashboard.</li>
      </ul>

      ${ctaButton(`${L.base}/dashboard`, "Open your dashboard")}
      <p>Guides: <a href="${L.knowledge}">Knowledge base</a> ·
      <a href="${L.billing}">Billing</a> ·
      <a href="${L.stripe}">Card / Tap &amp; Go</a></p>

      <p>Questions or something missing for your stall? Reply to this email or
      <a href="${L.featureRequest}">request a feature</a> - we build for real
      stands.</p>
      <p>Thanks for being with ${APP_NAME}.</p>
    `,
  );
}

export async function sendFeatureAnnounce(r: Recipient) {
  await sendOwnerEmail(r.to, FEATURE_ANNOUNCE_SUBJECT, featureAnnounceHtml(r.name), {
    replyTo: emailReplyTo(),
    kind: "announce_free_fee_pro_2026_08",
  });
}
