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
  "[NEW UPDATES] - Stallside: Starter free forever, Pro trial, and more";

export function featureAnnounceHtml(name: string): string {
  const L = lifecycleLinks();
  return emailShell(
    FEATURE_ANNOUNCE_SUBJECT,
    `
      <p>Hi ${greetName(name)},</p>
      <p>We&apos;ve updated how Stallside plans work - and shipped more tools for
      stall owners.</p>

      <p><strong>Starter is free forever</strong></p>
      <p>Cash, PayID (Australia only), products and options, stock, QR posters, alerts,
      and the card-demand counter - no card, no expiry. New owners also get a
      <strong>30-day Pro trial</strong> (Tap &amp; Go, pre-orders, branding, restock
      notify). When it ends you stay on Starter - the dashboard never locks.</p>

      <p><strong>What&apos;s new</strong></p>
      <ul>
        <li><strong>Pre-orders</strong> - customers pay by card to reserve for a
        collection day, with an order-by deadline. You track who&apos;s coming in
        Collections (Ready → Collected), optionally show exact slots left, and message
        buyers from Stallside.</li>
        <li><strong>Product options</strong> - flavours, sizes, and similar choices on
        a product (up to three option groups).</li>
        <li><strong>Stand branding</strong> - your logo and colours on the public stall
        and QR poster, plus social links (Instagram, Facebook, TikTok, YouTube, website).</li>
        <li><strong>Restock emails</strong> - customers opt in after checkout (free on
        Starter); sending the notify is Pro. You never see their addresses.</li>
        <li><strong>Hide / archive / duplicate</strong> products when you need to rotate
        stock without losing settings.</li>
      </ul>

      ${ctaButton(`${L.base}/dashboard`, "Open your dashboard")}
      <p>Guides: <a href="${L.knowledge}">Knowledge base</a> ·
      <a href="${L.billing}">Billing</a> ·
      <a href="${`${L.base}/dashboard/knowledge/pre-orders`}">Pre-orders</a></p>

      <p>Want something else for your stall? Reply or
      <a href="${L.featureRequest}">request a feature</a> - we build for real stands.</p>
      <p>Thanks for being with ${APP_NAME}.</p>
    `,
  );
}

export async function sendFeatureAnnounce(r: Recipient) {
  await sendOwnerEmail(r.to, FEATURE_ANNOUNCE_SUBJECT, featureAnnounceHtml(r.name), {
    replyTo: emailReplyTo(),
    kind: "announce_features_trial",
  });
}
