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
  "New: Customer Choice cart, QR editor, and SMS coming soon";

export function featureAnnounceHtml(name: string): string {
  const L = lifecycleLinks();
  return emailShell(
    FEATURE_ANNOUNCE_SUBJECT,
    `
      <p>Hi ${greetName(name)},</p>
      <p>We've added a few new features and improvements to ${APP_NAME}.
      They're available on both <strong>Free and Pro</strong> plans.</p>

      <p><strong>New: Two checkout options for your stall</strong></p>
      <p>You can now choose how customers check out from your QR code.</p>
      <p>There are <strong>two options</strong>:</p>
      <ul>
        <li><strong>Product Cart</strong> - customers choose the individual
        products they're buying from your ${APP_NAME} catalogue, with stock
        tracked as items sell.</li>
        <li><strong>Customer Choice</strong> - customers simply enter the value
        of what they're buying and pay the total.</li>
      </ul>
      <p><strong>Customer Choice</strong> is useful for unattended stalls, sheds
      and shops where items already have prices displayed and you may simply
      want customers to enter a total rather than select individual products.</p>
      <p>For example, if they pick up a $10 item and a $5 item, they enter
      <strong>$10 + $5</strong> and check out for <strong>$15</strong>.</p>
      <p>They can then pay by cash, card or local bank transfer.</p>
      <p>To choose your checkout type, go to
      <strong>My Businesses → QR &amp; Print</strong> and select either
      <strong>Product Cart</strong> or <strong>Customer Choice</strong>.</p>
      <p>You can switch between the two anytime.</p>
      <p><a href="${L.knowledge}/customer-choice-cart">Customer Choice guide</a></p>

      <p><strong>New: Live QR poster editor</strong></p>
      <p>On the <strong>QR &amp; Print</strong> page, you can now edit your
      poster while seeing a live preview beside it.</p>
      <p>Change the text, turn sections on or off, and see exactly what your
      customers will see before you save and print it.</p>

      <p><strong>Improved product photo uploads</strong></p>
      <p>Photos taken on newer phones can be very large, which was causing some
      uploads to fail.</p>
      <p>We've increased the upload limit and ${APP_NAME} now automatically
      resizes large photos when needed, so uploading product photos from your
      phone should be much more reliable.</p>

      <p><strong>Faster dashboard and checkout</strong></p>
      <p>We've shipped a performance update across the backend and frontend.
      Your owner dashboard and your customers' checkout pages should load and
      feel snappier.</p>

      <p><strong>Also recent</strong></p>
      <ul>
        <li>Filter your sales chart by <strong>stall sales, pre-orders or
        subscriptions</strong></li>
        <li>See <strong>in-app notifications</strong> inside your ${APP_NAME}
        dashboard, alongside email and push notifications</li>
      </ul>

      <p><strong>Reminder: pre-orders and subscriptions are live</strong></p>
      <p>From our last update - if you missed it -
      <strong>pre-order pages</strong> and <strong>shopper subscriptions</strong>
      are available on Free and Pro.</p>
      <p>They're a great fit for <strong>bakers and producers</strong> who take
      orders ahead of a bake or collection day, or who sell weekly, fortnightly
      or monthly boxes.</p>
      <ul>
        <li><strong>Pre-orders</strong> - one page per collection or delivery
        day, card payment to reserve, make list and packing in Collections.</li>
        <li><strong>Subscriptions</strong> - recurring boxes on card; shoppers
        can skip, pause or cancel themselves.</li>
      </ul>
      <p>Guides:
      <a href="${L.knowledge}/pre-order-pages">Pre-order pages</a> ·
      <a href="${L.knowledge}/subscriptions">Subscriptions</a></p>

      <p><strong>Coming soon: SMS for pre-orders and subscriptions</strong></p>
      <p>We're also working on <strong>SMS messaging for pre-orders and
      subscriptions</strong>.</p>
      <p>The goal is to make it easier to keep regular customers updated without
      relying on email alone.</p>
      <p>Planned features include:</p>
      <ul>
        <li>Let customers opt in to SMS updates</li>
        <li>Text customers when a new pre-order opens</li>
        <li>Send pickup and collection reminders</li>
        <li>Notify subscription customers about upcoming orders</li>
        <li>Send payment or balance reminders where needed</li>
      </ul>
      <p>This will be especially useful for regular drops, baked goods, produce
      boxes and other businesses where customers need to know when ordering
      opens or when their order is ready.</p>
      <p>More details soon.</p>

      ${ctaButton(`${L.base}/dashboard`, "Open your dashboard")}

      <p>Thanks for using ${APP_NAME}.</p>
      <p>Cheers,<br/>The ${APP_NAME} Team</p>
    `,
  );
}

export async function sendFeatureAnnounce(r: Recipient) {
  await sendOwnerEmail(r.to, FEATURE_ANNOUNCE_SUBJECT, featureAnnounceHtml(r.name), {
    replyTo: emailReplyTo(),
    kind: "announce_features_2026_08_21",
  });
}
