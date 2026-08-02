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
  "What's new on Stallside: Starter free forever, Pro, and fresh tools";

export function featureAnnounceHtml(name: string): string {
  const L = lifecycleLinks();
  return emailShell(
    FEATURE_ANNOUNCE_SUBJECT,
    `
      <p>Hi ${greetName(name)},</p>
      <p>We've been busy. Here's what's live on ${APP_NAME} - a clearer plan model,
      plus tools that make the stall feel more like your farm.</p>

      <p><strong>Plans, simplified</strong></p>
      <p><strong>Starter</strong> is free forever: cash, PayID (Australia only),
      products and options, stock, QR posters, sale and low-stock alerts, and a new
      <strong>card-demand counter</strong> (shoppers can tap “I'd have paid by card”
      when Tap &amp; Go isn't on - you see the count on your dashboard).</p>
      <p><strong>Stallside Pro</strong> adds Tap &amp; Go (card, Apple Pay, Google Pay),
      pre-orders and Collections, stand branding and social links, and restock notify
      emails. From A$19.99 / US$14.99 / £11.99 / €14.99 per site / month.</p>
      <p><strong>If you're mid-trial right now:</strong> your remaining days now
      include <strong>every Pro feature</strong> - Tap &amp; Go, pre-orders,
      Collections, branding, restock notify, and the rest. Same end date; fuller
      access. When the trial ends you stay on <strong>Starter free forever</strong>
      - the dashboard never locks. Stands, products, QR posters, and order history
      stay either way.</p>
      <p>New owners still get a 30-day Pro trial with all features from day one
      (no card required).</p>
      <p>If you were on the old Cash or Card labels, you're on this same model now:
      Starter = free forever; Pro = the full paid toolkit. Check
      <a href="${L.billing}">Settings → Billing</a> anytime.</p>

      <p><strong>New tools for stall owners</strong></p>
      <ul>
        <li><strong>Pre-orders</strong> - customers pay by card to reserve for a
        collection day, with an order-by deadline. Track who's coming in Collections
        (Ready → Collected), show exact slots left if you want, and message buyers
        from Stallside. Use <strong>Email all</strong> for everyone collecting on a day.</li>
        <li><strong>Product options</strong> - flavours, sizes, and similar choices
        (up to three option groups) - included on Starter.</li>
        <li><strong>Stand branding</strong> - your logo and colours on the public stall
        and QR poster, plus Instagram, Facebook, TikTok, YouTube, or your website.</li>
        <li><strong>Restock list</strong> - customers can opt in after checkout (free on
        Starter). Sending the “we're back” email is Pro.</li>
        <li><strong>Hide / archive / duplicate</strong> products when you rotate stock
        without losing settings.</li>
      </ul>

      ${ctaButton(`${L.base}/dashboard`, "Open your dashboard")}
      <p>Guides: <a href="${L.knowledge}">Knowledge base</a> ·
      <a href="${L.billing}">Billing</a> ·
      <a href="${`${L.base}/dashboard/knowledge/pre-orders`}">Pre-orders</a></p>

      <p>Questions or something missing for your stall? Reply to this email or
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
