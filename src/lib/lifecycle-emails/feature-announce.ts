import { readFileSync } from "fs";
import { join } from "path";
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

/** Inline attachment content-id, paired with Resend attachments. */
const SALES_SCREENSHOT_CID = "producer-sales-sep";

export const FEATURE_ANNOUNCE_SUBJECT =
  "Vendl is growing: more than a farm stand app";

function salesScreenshotAttachment() {
  const path = join(process.cwd(), "public/email/producer-sales-sep.png");
  return {
    content: readFileSync(path).toString("base64"),
    filename: "producer-sales-sep.png",
    contentId: SALES_SCREENSHOT_CID,
    contentType: "image/png",
  };
}

export function featureAnnounceHtml(name: string): string {
  const L = lifecycleLinks();
  return emailShell(
    FEATURE_ANNOUNCE_SUBJECT,
    `
      <p>Hi ${greetName(name)},</p>
      <p>Quick update from us.</p>
      <p>${APP_NAME} started as a simple way to take stall sales - scan, pay,
      get notified. That's still at the core. What's changed is everything
      around it.</p>
      <p>We're building ${APP_NAME} into a full farm and home-producer platform:
      one place for your business: custom website, checkout, orders, regulars,
      menus, COGS, make lists, POS integrations, and the work behind what you
      sell.</p>

      <p><strong>What's live now</strong> (on Free and Pro)</p>
      <ul>
        <li><strong>Stall checkout</strong> - cash, local bank transfer,
        multi-currency, card and other payment methods, including Customer
        Choice cart and the live QR poster editor</li>
        <li><strong>Pre-orders &amp; Collections</strong> - take orders ahead
        of bake or harvest day; make lists, pack, and mark Ready → Collected</li>
        <li><strong>Subscriptions &amp; memberships</strong> - recurring boxes,
        plus fixed-term / payment-plan membership offers; shoppers can skip,
        pause, or cancel themselves</li>
        <li><strong>Customers</strong> - profiles and lists so your regulars
        live in ${APP_NAME}, not a spreadsheet</li>
        <li><strong>Communication</strong> - email your audiences, create lists
        &amp; segments, and restock list from the dashboard</li>
        <li><strong>Suppliers</strong> - sell a neighbour's or others' produce
        alongside your own, with a Supply desk for shared stock</li>
      </ul>

      <p>If you haven't started using all the features yet, now's the time.</p>

      <p><strong>How others are using it</strong></p>
      <p>You can see some of yesterday's aggregated sales from current home
      producers using ${APP_NAME} in the following screenshot - this is just a
      sample of all sales of businesses using ${APP_NAME}. A combination of
      stall sales, pre-orders, and memberships - everything from eggs to bread
      to gift hampers.</p>
      <p style="margin:16px 0">
        <img
          src="cid:${SALES_SCREENSHOT_CID}"
          alt="Redacted card sales from Vendl producers"
          width="560"
          style="max-width:100%;height:auto;border:1px solid #d8e0d4;border-radius:8px;display:block"
        />
      </p>

      <p><strong>BUT, what's more exciting is what's coming next:</strong></p>
      <ul>
        <li><strong>Web Studio</strong> - build your farm or home-kitchen site
        inside ${APP_NAME} - your own style, branding</li>
        <li><strong>Custom domains</strong> - put your own domain on that
        site</li>
        <li><strong>Recipes &amp; production</strong> - plan what you make,
        cost it, pricing calculator, and tie it to what you sell</li>
        <li><strong>Calendar</strong> - collection days and ops in one view</li>
        <li><strong>Marketing toolkit</strong> - campaigns, coupons, loyalty,
        and more ways to bring regulars back</li>
        <li><strong>Square</strong> - another way to take payments when you're
        ready, including POS inventory sync (great for those that use POS at
        markets)</li>
        <li><strong>SMS</strong> - opt-in texts for pre-order opens, pickup
        reminders, and subscription drops</li>
      </ul>

      ${ctaButton(`${L.base}/dashboard`, "Open your dashboard")}

      <p>Thanks for being with us while we grow this.</p>
      <p>Cheers,<br/>Jono / The ${APP_NAME} Team</p>
    `,
  );
}

export async function sendFeatureAnnounce(r: Recipient) {
  await sendOwnerEmail(r.to, FEATURE_ANNOUNCE_SUBJECT, featureAnnounceHtml(r.name), {
    replyTo: emailReplyTo(),
    kind: "announce_features_2026_09_24",
    attachments: [salesScreenshotAttachment()],
  });
}
