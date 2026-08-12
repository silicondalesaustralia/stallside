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
  "[NEW FEATURES] @ Vendl: Pricing Model Change & More Features Added";

export function featureAnnounceHtml(name: string): string {
  const L = lifecycleLinks();
  return emailShell(
    FEATURE_ANNOUNCE_SUBJECT,
    `
      <p>Hi ${greetName(name)},</p>
      <p>Quick update from ${APP_NAME}: plans are simpler, checkout got stronger.
      Free now includes everything - whether you sell at a stall or take
      pre-orders.</p>

      <p><strong>Plans (the important bit)</strong></p>
      <p><strong>Free</strong> is $0/mo with <strong>every feature</strong>:
      stall QR checkout, pre-orders, cart upsells and add-ons, Tap &amp; Go,
      pay-later, branding, restock emails, and more.</p>
      <p>On Free, Vendl takes <strong>2.5%</strong> on card, Tap &amp; Go,
      and pay-later. Standard Stripe processing fees apply separately.</p>
      <p><strong>Vendl Pro</strong> is the same product with
      <strong>no Vendl transaction fee</strong> on card, Tap &amp; Go, and
      pay-later. From A$19.99 / US$14.99 / £11.99 / €14.99 per site / month.</p>
      <p>Upgrade to Pro anytime to remove the Vendl fee.
      <a href="${L.billing}">Settings → Billing</a>.</p>

      <p><strong>Also live</strong></p>
      <ul>
        <li><strong>Cart upsells</strong> - offer an extra item at checkout
        (stall or the same collection day) without a second payment.</li>
        <li><strong>Pre-orders</strong> - share a link, take card payment, bake
        or pack from a make list.</li>
        <li><strong>Stall checkout</strong> - one QR so customers pay on their
        phone. No terminal.</li>
        <li><strong>Buy Now, Pay Later</strong> - Zip and Klarna on larger
        Stripe Checkout orders where Stripe supports them.</li>
        <li><strong>Branding</strong> - logo, colours, and social links on your
        public page and QR poster.</li>
      </ul>

      ${ctaButton(`${L.base}/dashboard`, "Open your dashboard")}
      <p>Guides: <a href="${L.knowledge}">Knowledge base</a> ·
      <a href="${L.billing}">Billing</a> ·
      <a href="${L.stripe}">Card / Tap &amp; Go</a></p>

      <p>Questions or something missing? Reply or
      <a href="${L.featureRequest}">request a feature</a>.</p>
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
