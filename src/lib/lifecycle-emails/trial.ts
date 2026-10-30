import { APP_NAME } from "@/lib/constants";
import { sendOwnerEmail } from "@/lib/notify-email";
import {
  JONO_REPLY_TO,
  JONO_SIGNATURE,
  emailShell,
  greetName,
  jonoFrom,
  textLink,
} from "@/lib/lifecycle-emails/html";
import { lifecycleLinks } from "@/lib/lifecycle-emails/links";
import { skoolWelcomeSection } from "@/lib/lifecycle-emails/skool-community";

type Recipient = { to: string; name: string; businessName?: string };

export const TRIAL_WELCOME_SUBJECT = `Welcome to ${APP_NAME}: a quick note from me`;

const DIVIDER = `<hr style="border:none;border-top:1px solid #DDE5DA;margin:24px 0">`;

export function trialWelcomeHtml(name: string): string {
  const L = lifecycleLinks();
  return emailShell(
    TRIAL_WELCOME_SUBJECT,
    `
      <p>Hi ${greetName(name)},</p>
      <p>This is Jono, co-founder of ${APP_NAME}. Thanks for signing up, genuinely.</p>
      <p>${APP_NAME} exists because I watched too many bakers, home producers, and
      small food businesses duct-tape together Shopify or other platforms, a
      pre-order app, an inventory tool, and a subscription plugin, then pay
      $60+/month for the privilege of doing that admin work themselves.
      That's broken. So we built the whole thing in one place, and we include
      every feature on the free plan. No paywalls on the basics. Ever.</p>
      <p><strong>Here's the fastest way to start making money:</strong></p>
      <p><strong>Connect your payment provider.</strong></p>
      <p>If you're in Australia and already use Square, connect it now. Your
      products and inventory sync automatically, and you can start taking card
      payments in minutes. If you'd rather use Stripe, that works too. Not
      ready for cards yet? No problem. You can sell with cash and add payments
      later.</p>
      <p>→ ${textLink(L.square, "Connect Square")} (recommended for AU)<br>
      → ${textLink(L.stripe, "Connect Stripe")}</p>
      ${DIVIDER}
      <p><strong>Then, pick the path that fits how you sell:</strong></p>
      <p><strong>🥖 Selling at a market, stall, or roadside?</strong><br>
      Add what you sell, set up your checkout, print a QR code, and you're live.<br>
      → ${textLink(L.newStand, "Set up a stall checkout")}</p>
      <p><strong>📦 Taking pre-orders?</strong><br>
      Sell now, bake or prepare later. Set a pickup day, take deposits, and
      charge the balance when they collect.<br>
      → ${textLink(L.newPreOrder, "Create a pre-order page")}</p>
      <p><strong>🔁 Running a subscription or box scheme?</strong><br>
      Weekly bread clubs, veggie boxes, CSA shares. Set it up once, get paid
      automatically.<br>
      → ${textLink(L.newSubscription, "Create a subscription")}</p>
      ${DIVIDER}
      <p><strong>Why we're different:</strong></p>
      <p>We ship updates every week. If you need something we don't have, reply
      to this email and I'll tell you honestly whether it's on the roadmap, and
      how soon. No support tickets. No canned responses. Just me and the team.</p>
      <p>And if something breaks? Reply to this email. We fix it.</p>
      ${DIVIDER}
      ${skoolWelcomeSection()}
      ${DIVIDER}
      <p><strong>Ready to go?</strong></p>
      <p>→ ${textLink(L.dashboard, "Open your dashboard")} |
      → ${textLink(L.gallerySubmit, "See other producers' shops")}</p>
      <p>Welcome aboard. Genuinely glad you're here.</p>
      ${JONO_SIGNATURE}
    `,
    "Everything's included. Let's get you paid.",
  );
}

/** Welcome email for new Free owners, from Jono. */
export async function sendTrialWelcome(r: Recipient) {
  await sendOwnerEmail(r.to, TRIAL_WELCOME_SUBJECT, trialWelcomeHtml(r.name), {
    from: jonoFrom(),
    replyTo: JONO_REPLY_TO,
    kind: "lifecycle_welcome",
  });
}
