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

async function send(to: string, subject: string, html: string, kind: string) {
  await sendOwnerEmail(to, subject, html, { replyTo: emailReplyTo(), kind });
}

export async function sendCashWelcome(r: Recipient) {
  const L = lifecycleLinks();
  const html = emailShell(
    `You’re on ${APP_NAME} Cash`,
    `
      <p>Hi ${greetName(r.name)},</p>
      <p>Thanks for subscribing to <strong>${APP_NAME} Cash</strong>. Your stand stays online
      with cash and PayID (Australia only), stock tracking, QR posters, and sale /
      low-stock alerts.</p>
      <p><strong>Useful next steps</strong></p>
      <ul>
        <li><a href="${L.stands}">Print / refresh your QR sign</a></li>
        <li>Turn on <a href="${L.settings}">alerts</a> if you haven&apos;t</li>
        <li><a href="${L.knowledge}">Guides</a> when you need a refresh</li>
      </ul>
      <p>Anytime you want customer card payments (Apple Pay and Google Pay when linked)
      plus restock emails, you can upgrade to the <strong>Card</strong> plan:</p>
      ${ctaButton(L.billingCard, "See the Card plan")}
      <p>Questions: <strong>hello@stallside.app</strong>.</p>
    `,
  );
  await send(r.to, `You’re on ${APP_NAME} Cash - welcome`, html, "lifecycle_cash_welcome");
}

export async function sendCashUpgradeDay2(r: Recipient) {
  const L = lifecycleLinks();
  const html = emailShell(
    "Customers who only carry a card",
    `
      <p>Hi ${greetName(r.name)},</p>
      <p>On Cash, you&apos;re set for cash and PayID (Australia only). A lot of stall owners
      still lose a few sales when someone only has a card or phone wallet.</p>
      <p>The <strong>Card</strong> plan adds customer card checkout on the same QR - including
      Apple Pay and Google Pay when those are linked on their device. No hardware, no
      percentage of your sales to ${APP_NAME}. Money goes to your Stripe account.</p>
      ${ctaButton(L.billingCard, "Upgrade to Card")}
      <p>Happy on Cash? Ignore this - Cash is a proper plan, not a trap.</p>
      <p>Need a different payment type for your customers?
      <a href="${L.featureRequest}">Request a feature</a>.</p>
    `,
  );
  await send(r.to, "Customers who only carry a card", html, "lifecycle_cash_upgrade_d2");
}

export async function sendCashUpgradeDay7(r: Recipient) {
  const L = lifecycleLinks();
  const html = emailShell(
    "Tell customers when you’ve restocked",
    `
      <p>Hi ${greetName(r.name)},</p>
      <p>One Card-plan feature stall owners like: <strong>restock alerts</strong>.</p>
      <p>After checkout, customers can ask to be emailed when you restock. You see a count.
      One tap when you&apos;ve filled the stand again.</p>
      <p>That sits on the <strong>Card</strong> plan, along with card / Apple Pay / Google Pay
      checkout.</p>
      ${ctaButton(L.billingCard, "Upgrade")}
      <p>Still not sure - or want another payment method entirely? Reply or
      <a href="${L.featureRequest}">request a feature</a>. Rational requests, we&apos;ll look
      at building.</p>
    `,
  );
  await send(r.to, "Tell customers when you’ve restocked", html, "lifecycle_cash_upgrade_d7");
}

export async function sendCashUpgradeDay14(r: Recipient) {
  const L = lifecycleLinks();
  const html = emailShell(
    "Still thinking about card payments?",
    `
      <p>Hi ${greetName(r.name)},</p>
      <p>Last note from us on the Card plan for a while.</p>
      <p><strong>Cash</strong> keeps working as it does today.<br/>
      <strong>Card</strong> adds customer card checkout (Apple Pay and Google Pay when linked),
      plus restock emails - still no terminal.</p>
      ${ctaButton(L.billingCard, "Compare / upgrade")}
      <p>Need help connecting Stripe? <a href="${L.stripe}">Stripe settings</a> or
      <strong>hello@stallside.app</strong>.</p>
      <p>Want PayPal, bank apps, or something else in your country?
      <a href="${L.featureRequest}">Tell us via a feature request</a>.</p>
    `,
  );
  await send(r.to, "Still thinking about card payments?", html, "lifecycle_cash_upgrade_d14");
}

export async function sendCardWelcome(r: Recipient) {
  const L = lifecycleLinks();
  const html = emailShell(
    `You’re on the ${APP_NAME} Card plan`,
    `
      <p>Hi ${greetName(r.name)},</p>
      <p>Welcome to the <strong>Card</strong> plan. You&apos;ve got everything in Cash, plus
      customer card payments (Apple Pay and Google Pay when linked on their device) and
      restock emails.</p>
      <p><strong>Get card checkout live</strong></p>
      <ol>
        <li><a href="${L.stripe}">Connect Stripe</a> (finish onboarding so charges are enabled)</li>
        <li>Confirm your stand is active and QR is posted</li>
        <li>Do a small test checkout with a card (or Apple Pay / Google Pay if set up on the phone)</li>
      </ol>
      ${ctaButton(L.stripe, "Open Stripe settings")}
      <p>Guides: <a href="${L.customerPayments}">Customer payments</a> ·
      <a href="${L.billingGuide}">Billing</a></p>
      <p>Missing a payment type your customers use?
      <a href="${L.featureRequest}">Request a feature</a>.</p>
      <p>Anything odd in setup? <strong>hello@stallside.app</strong>.</p>
    `,
  );
  await send(r.to, `You’re on the ${APP_NAME} Card plan`, html, "lifecycle_card_welcome");
}
