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

async function send(to: string, subject: string, html: string) {
  await sendOwnerEmail(to, subject, html, { replyTo: emailReplyTo() });
}

export async function sendTrialWelcome(r: Recipient) {
  const L = lifecycleLinks();
  const html = emailShell(
    `Welcome to ${APP_NAME}`,
    `
      <p>Hi ${greetName(r.name)},</p>
      <p>Thanks for starting your 30-day ${APP_NAME} trial. Glad you&apos;re here.</p>
      <p>We started with a kid&apos;s roadside egg stall, sold-out stock and no-cash shoppers.
      It&apos;s why we created ${APP_NAME} in the first place.</p>
      <p>${APP_NAME} is what we wished we&apos;d had: customers scan a QR, pay, and you get the
      sale and stock update on your phone.</p>
      <p><strong>Start here</strong></p>
      <ol>
        <li>Create your first stand</li>
        <li>Add a product and stock</li>
        <li>Print your QR sign</li>
        <li>Run a quick test cash checkout on your phone</li>
      </ol>
      ${ctaButton(L.newStand, "Create your first stand")}
      <p>Need a walkthrough? <a href="${L.firstStand}">Your first stand in 10 minutes</a>
      - or browse all <a href="${L.knowledge}">Guides</a>.</p>
      <p><strong>What&apos;s on the Card plan</strong> (available on your trial and after you
      subscribe - upgrade anytime from Billing):</p>
      <ul>
        <li>Everything in Cash: cash and PayID (if in Australia), stock tracking, QR posters,
        sale and low-stock alerts</li>
        <li>Customer card checkout on the same QR - including Apple Pay and Google Pay when
        linked on their device</li>
        <li>Restock emails: customers opt in after checkout</li>
        <li>No terminal. No hardware. No percentage of your sales</li>
        <li>Customer payments go straight to your Stripe account</li>
        <li>PayPal coming soon + other payment options globally on request</li>
      </ul>
      <p><a href="${L.billingCard}">See Card plan pricing</a></p>
      <p><strong>Features you&apos;d like?</strong> We&apos;re a small team building for real
      stalls. If something would help your stand - another payment type for your region,
      a stock flow, a sign option, whatever is rational - tell us and we&apos;ll seriously
      consider building it.</p>
      ${ctaButton(L.featureRequest, "Request a feature")}
      <p>Stuck on anything else? Reply to this email or write to
      <strong>hello@stallside.app</strong>.</p>
    `,
  );
  await send(r.to, `Welcome to ${APP_NAME} - let’s get your stand live`, html);
}

export async function sendTrialDay7(r: Recipient) {
  const L = lifecycleLinks();
  const html = emailShell(
    `How’s ${APP_NAME} going?`,
    `
      <p>Hi ${greetName(r.name)},</p>
      <p>You&apos;ve had ${APP_NAME} for a week. How&apos;s it feeling at the stand?</p>
      <p>If something&apos;s confusing, slow, or missing - tell us. Reply here or email
      <strong>hello@stallside.app</strong>.</p>
      <p><strong>Want a feature?</strong> If it&apos;s a rational request that helps stall
      owners, we&apos;ll seriously consider building it. That includes other payment
      types for your region (beyond cash, PayID if in Australia, and card / Apple Pay /
      Google Pay) - tell us what your customers ask for.</p>
      ${ctaButton(L.featureRequest, "Request a feature")}
      <p>Still finding your feet? <a href="${L.knowledge}">Guides</a> are there when you need them.</p>
    `,
  );
  await send(r.to, `How’s ${APP_NAME} going?`, html);
}

export async function sendTrialDay14(r: Recipient) {
  const L = lifecycleLinks();
  const html = emailShell(
    "Halfway through your free trial",
    `
      <p>Hi ${greetName(r.name)},</p>
      <p>You&apos;re halfway through your 30-day trial (about 16 days left).</p>
      <p>Quick check-in: is your stand QR live? Have you had a real sale yet?</p>
      <p>If you&apos;re blocked on anything - stock, signs, alerts, payments - reply or email
      <strong>hello@stallside.app</strong>.</p>
      <p>When you&apos;re ready after the trial, you can keep going on <strong>Cash</strong>
      or step up to the <strong>Card</strong> plan (customer card payments, including Apple Pay
      and Google Pay when their wallet is linked).</p>
      ${ctaButton(L.billing, "View billing")}
      <p>Need a different payment type for your area?
      <a href="${L.featureRequest}">Request a feature</a> - we build what stall owners need.</p>
    `,
  );
  await send(r.to, `Halfway through your ${APP_NAME} trial`, html);
}

export async function sendTrialDay28(r: Recipient) {
  const L = lifecycleLinks();
  const html = emailShell(
    "Your free trial ends in 2 days",
    `
      <p>Hi ${greetName(r.name)},</p>
      <p>Your free trial ends in <strong>two days</strong>.</p>
      <p>To keep your stand online, pick a plan and subscribe:</p>
      ${ctaButton(L.billing, "Subscribe now")}
      <p><strong>Cash</strong> - cash and PayID (if in Australia), stock tracking, QR posters,
      sale &amp; low-stock alerts.</p>
      <p><strong>Card</strong> - everything in Cash, plus customer card checkout (Apple Pay and
      Google Pay when linked on their device), and restock emails for customers. No terminal.</p>
      <p>Want another payment method? <a href="${L.featureRequest}">Send a feature request</a>.</p>
      <p>Questions? <strong>hello@stallside.app</strong> or
      <a href="${L.contact}">Contact</a>.</p>
    `,
  );
  await send(r.to, `Your ${APP_NAME} trial ends in 2 days`, html);
}

export async function sendTrialDay30(r: Recipient) {
  const L = lifecycleLinks();
  const name = escapeHtml(r.businessName?.trim() || r.name.trim() || "there");
  const html = emailShell(
    "Your free trial has ended",
    `
      <p>Hi ${name},</p>
      <p>Your free trial has ended. To keep (or restore) your stand online:</p>
      ${ctaButton(L.billing, "Subscribe to Stallside")}
      <p>Choose <strong>Cash</strong> or <strong>Card</strong> on that page -
      Stripe handles payment securely.</p>
      <p><strong>Not continuing?</strong> We&apos;d genuinely like to know why. A quick note
      helps us improve ${APP_NAME} for other stall owners:</p>
      ${ctaButton(L.feedback, "Send feedback")}
      <p>Or reply / email <strong>hello@stallside.app</strong>.</p>
      <p>Thanks for trying ${APP_NAME}.</p>
    `,
  );
  await send(
    r.to,
    `Your ${APP_NAME} free trial has ended. Subscribe to keep going`,
    html,
  );
}
