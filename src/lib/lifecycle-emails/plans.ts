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

async function send(to: string, subject: string, html: string) {
  await sendOwnerEmail(to, subject, html, { replyTo: emailReplyTo() });
}

export async function sendCashWelcome(r: Recipient) {
  const L = lifecycleLinks();
  const html = emailShell(
    `You’re on ${APP_NAME} Cash`,
    `
      <p>Hi ${greetName(r.name)},</p>
      <p>Thanks for subscribing to <strong>${APP_NAME} Cash</strong>. Your stand stays online
      with cash (and PayID where available), stock tracking, QR posters, and sale /
      low-stock alerts.</p>
      <p><strong>Useful next steps</strong></p>
      <ul>
        <li><a href="${L.stands}">Print / refresh your QR sign</a></li>
        <li>Turn on <a href="${L.settings}">alerts</a> if you haven&apos;t</li>
        <li><a href="${L.knowledge}">Guides</a> when you need a refresh</li>
      </ul>
      <p>Anytime you want Tap &amp; Go plus customer restock emails, you can upgrade:</p>
      ${ctaButton(L.billingCard, "See Card / Tap & Go")}
      <p>Questions: <strong>hello@stallside.app</strong>.</p>
    `,
  );
  await send(r.to, `You’re on ${APP_NAME} Cash — welcome`, html);
}

export async function sendCashUpgradeDay2(r: Recipient) {
  const L = lifecycleLinks();
  const html = emailShell(
    "Customers who only carry a card",
    `
      <p>Hi ${greetName(r.name)},</p>
      <p>On Cash, you&apos;re set for cash (and PayID where available). A lot of stall owners
      still lose a few sales when someone only has a card or phone wallet.</p>
      <p><strong>Card / Tap &amp; Go</strong> adds card, Apple Pay, and Google Pay on the same
      QR — no hardware, no percentage of your sales to ${APP_NAME}. Money goes to your
      Stripe account.</p>
      ${ctaButton(L.billingCard, "Upgrade to Card / Tap & Go")}
      <p>Happy on Cash? Ignore this — Cash is a proper plan, not a trap.</p>
    `,
  );
  await send(r.to, "Customers who only carry a card", html);
}

export async function sendCashUpgradeDay7(r: Recipient) {
  const L = lifecycleLinks();
  const html = emailShell(
    "Tell customers when you’ve restocked",
    `
      <p>Hi ${greetName(r.name)},</p>
      <p>One Card-plan feature stall owners like: <strong>restock alerts</strong>.</p>
      <p>After checkout, customers can ask to be emailed when you restock. You see a count,
      not their addresses. One tap when you&apos;ve filled the stand again.</p>
      <p>That sits on <strong>Card / Tap &amp; Go</strong>, along with Tap &amp; Go payments.</p>
      ${ctaButton(L.billingCard, "Upgrade")}
      <p>Still not sure? Reply and tell us what would make Card worth it — rational
      requests, we&apos;ll look at building.</p>
    `,
  );
  await send(r.to, "Tell customers when you’ve restocked", html);
}

export async function sendCashUpgradeDay14(r: Recipient) {
  const L = lifecycleLinks();
  const html = emailShell(
    "Still thinking about Tap & Go?",
    `
      <p>Hi ${greetName(r.name)},</p>
      <p>Last note from us on Card for a while.</p>
      <p><strong>Cash</strong> keeps working as it does today.<br/>
      <strong>Card / Tap &amp; Go</strong> adds Tap &amp; Go at the gate, restock emails,
      PayPal coming later — still no terminal.</p>
      ${ctaButton(L.billingCard, "Compare / upgrade")}
      <p>Need help connecting Stripe? <a href="${L.stripe}">Stripe settings</a> or
      <strong>hello@stallside.app</strong>.</p>
    `,
  );
  await send(r.to, "Still thinking about Tap & Go?", html);
}

export async function sendCardWelcome(r: Recipient) {
  const L = lifecycleLinks();
  const html = emailShell(
    `You’re on ${APP_NAME} Card / Tap & Go`,
    `
      <p>Hi ${greetName(r.name)},</p>
      <p>Welcome to <strong>Card / Tap &amp; Go</strong>. You&apos;ve got everything in Cash,
      plus digital payments and restock emails.</p>
      <p><strong>Get Tap &amp; Go live</strong></p>
      <ol>
        <li><a href="${L.stripe}">Connect Stripe</a> (finish onboarding so charges are enabled)</li>
        <li>Confirm your stand is active and QR is posted</li>
        <li>Do a small test checkout with a card / Apple Pay / Google Pay</li>
      </ol>
      ${ctaButton(L.stripe, "Open Stripe settings")}
      <p>Guides: <a href="${L.customerPayments}">Customer payments</a> ·
      <a href="${L.billingGuide}">Billing</a></p>
      <p>Anything odd in setup? <strong>hello@stallside.app</strong>.</p>
    `,
  );
  await send(r.to, `You’re on ${APP_NAME} Card / Tap & Go`, html);
}
