/**
 * Audit + send every outbound email template for brand review.
 * Usage: npx tsx scripts/send-all-email-previews.ts [email]
 *
 * Sends via Resend directly (skips owner-active filter) with [PREVIEW] subject prefix.
 */
import "dotenv/config";
import { APP_DOMAIN, APP_NAME } from "../src/lib/constants";
import { appBaseUrl } from "../src/lib/app-url";
import { cleanEnvSecret } from "../src/lib/env";
import {
  ctaButton,
  emailReplyTo,
  emailShell,
  greetName,
} from "../src/lib/lifecycle-emails/html";
import { lifecycleLinks } from "../src/lib/lifecycle-emails/links";
import {
  FEATURE_ANNOUNCE_SUBJECT,
  featureAnnounceHtml,
} from "../src/lib/lifecycle-emails/feature-announce";
import { trialWelcomeHtml } from "../src/lib/lifecycle-emails/trial";
import {
  CREATOR_DAY3_SUBJECT,
  creatorDay3Html,
} from "../src/lib/lifecycle-emails/creator-intro";
import {
  STRIPE_RESTRICTED_SUBJECT,
  stripeRestrictedHtml,
} from "../src/lib/lifecycle-emails/stripe-restricted";
import {
  STRIPE_NEVER_STARTED_SUBJECT,
  stripeNeverStartedHtml,
} from "../src/lib/lifecycle-emails/stripe-never-started";

const to = (process.argv[2] || "jono@silicondales.com").trim().toLowerCase();
const name = "Jono";
const base = appBaseUrl();
const L = lifecycleLinks();

type Job = {
  label: string;
  kind: string;
  subject: string;
  html: string;
  replyTo?: string;
  headers?: Record<string, string>;
};

async function sendRaw(job: Job) {
  const apiKey = cleanEnvSecret(process.env.RESEND_API_KEY);
  if (!apiKey) throw new Error("RESEND_API_KEY is not set");
  const from =
    cleanEnvSecret(process.env.EMAIL_FROM) ||
    `${APP_NAME} <hello@${APP_DOMAIN}>`;
  const body: Record<string, unknown> = {
    from,
    to: [to],
    subject: `[PREVIEW] ${job.subject}`,
    html: job.html,
  };
  if (job.replyTo) body.reply_to = job.replyTo;
  if (job.headers) body.headers = job.headers;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`${res.status} ${await res.text()}`);
  }
}

function buildJobs(): Job[] {
  const unsub = `${base}/unsubscribe/restock?token=preview-token`;
  const listUnsub = `${base}/api/restock/unsubscribe?token=preview-token`;

  return [
    {
      label: "OTP / sign-in code",
      kind: "otp",
      subject: `482193 is your ${APP_NAME} code`,
      html: `
        <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#182C1B">
          <p style="font-size:18px;font-weight:600">Your ${APP_NAME} sign-in code</p>
          <p style="font-size:32px;font-weight:700;letter-spacing:0.2em;margin:20px 0">482193</p>
          <p>Enter this code in ${APP_NAME}. It expires in 10 minutes.</p>
        </div>`,
    },
    {
      label: "Sale alert",
      kind: "sale",
      subject: `[${APP_NAME}] Sale · Green Valley Eggs`,
      html: `<p><strong>Sale · Green Valley Eggs</strong></p>
        <p>Card A$12.00 - 1× Dozen free-range · Demo Customer · demo@example.com</p>
        <p>Order FS-PREVIEW01</p>`,
    },
    {
      label: "Low stock alert",
      kind: "low_stock",
      subject: `[${APP_NAME}] Low stock · Green Valley Eggs`,
      html: `<p><strong>Low stock · Green Valley Eggs</strong></p>
        <p>Dozen free-range: 2 left (threshold 5)</p>`,
    },
    {
      label: "Sold out alert",
      kind: "sold_out",
      subject: `[${APP_NAME}] Sold out · Green Valley Eggs`,
      html: `<p><strong>Sold out · Green Valley Eggs</strong></p>
        <p>Dozen free-range is sold out. Restock when you can.</p>`,
    },
    {
      label: "Restock notify (customer)",
      kind: "restock",
      subject: `Green Valley Eggs has restocked`,
      replyTo: `${APP_NAME} <hello@${APP_DOMAIN}>`,
      headers: {
        "List-Unsubscribe": `<${listUnsub}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
      html: `
        <p><strong>Green Valley Eggs</strong> has just restocked.</p>
        <p>Fresh eggs are back on the stand this morning.</p>
        <p><a href="${base}/s/green-valley-eggs-australia">Visit the stand</a></p>
        <p style="font-size:13px;color:#5a6b5c;margin-top:24px">
          You asked ${APP_NAME} to email you when this stand restocks.
          <a href="${unsub}">Unsubscribe</a>
        </p>`,
    },
    {
      label: "Order / receipt (customer)",
      kind: "order_customer",
      subject: `[${APP_NAME}] Order confirmed · Green Valley Eggs`,
      html: `<p>Hi Demo Customer,</p>
        <p>Thanks for your order at <strong>Green Valley Eggs</strong>.</p>
        <p><strong>Order FS-PREVIEW01</strong> · A$12.00</p>
        <ul><li>1× Dozen free-range</li></ul>
        <p style="font-size:12px;color:#56684F">Keep this email for your records.</p>`,
    },
    {
      label: "Owner → customer (collections)",
      kind: "owner_to_customer",
      subject: `Your eggs are ready to collect`,
      html: `<p>From <strong>Green Valley Eggs</strong> (order FS-PREVIEW01)</p>
        <p>Hi - your pre-order is ready. Come by anytime today.</p>
        <p style="font-size:12px;color:#56684F;margin-top:24px">Sent via ${APP_NAME}</p>`,
    },
    {
      label: "Tap & Go interest",
      kind: "tap_and_go_interest",
      subject: `[${APP_NAME}] Customer wants Tap & Go or PayPal · Green Valley Eggs`,
      html: `
        <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#182C1B">
          <p style="font-size:18px;font-weight:600">Customer wants Tap &amp; Go or PayPal · Green Valley Eggs</p>
          <p>A customer who just paid at <strong>Green Valley Eggs</strong> said they would use
          <strong>Tap &amp; Go</strong> or <strong>PayPal</strong> if available - at this stand
          and others on ${APP_NAME}.</p>
          <p><a href="${L.stripe}">Open Stripe settings</a> ·
          <a href="${base}/dashboard/settings/paypal">Open PayPal settings</a></p>
        </div>`,
    },
    {
      label: "Welcome (Free signup)",
      kind: "lifecycle_welcome",
      replyTo: emailReplyTo(),
      subject: `Welcome to ${APP_NAME} - let’s get you live`,
      html: trialWelcomeHtml(name),
    },
    {
      label: "Creator Day 3",
      kind: "lifecycle_creator_day3",
      replyTo: "jono@silicondales.com",
      subject: CREATOR_DAY3_SUBJECT,
      html: creatorDay3Html(name),
    },
    {
      label: "Pro welcome",
      kind: "lifecycle_card_welcome",
      replyTo: emailReplyTo(),
      subject: `You're on ${APP_NAME} Pro`,
      html: emailShell(
        `You're on ${APP_NAME} Pro`,
        `
          <p>Hi ${greetName(name)},</p>
          <p>Welcome to <strong>${APP_NAME} Pro</strong>. Same features as Free - and
          <strong>no Vendl transaction fee</strong> on card, Tap &amp; Go, or pay-later.</p>
          ${ctaButton(L.stripe, "Open Stripe settings")}
          <p>Anything odd in setup? <strong>hello@${APP_DOMAIN}</strong>.</p>
        `,
      ),
    },
    {
      label: "Pro lapse Day 23",
      kind: "lifecycle_pro_lapse_day23",
      replyTo: emailReplyTo(),
      subject: `Still on ${APP_NAME} Free - Pro is ready when you are`,
      html: emailShell(
        "Still on Free - here's what Pro adds",
        `
          <p>Hi ${greetName(name)},</p>
          <p>It&apos;s been a few weeks on <strong>Free</strong> ($0/mo).</p>
          ${ctaButton(L.billingPro, "See Vendl Pro")}
          <p>Questions? <strong>hello@${APP_DOMAIN}</strong></p>
        `,
      ),
    },
    {
      label: "Pro lapse Day 45",
      kind: "lifecycle_pro_lapse_day45",
      replyTo: emailReplyTo(),
      subject: `Remove the Vendl fee with ${APP_NAME} Pro`,
      html: emailShell(
        "Remove the Vendl fee with Pro",
        `
          <p>Hi ${greetName(name)},</p>
          <p>A quick check-in from ${APP_NAME}.</p>
          <p>On Free you&apos;ve still got real demand:
            <strong>12</strong> shoppers tapped “I'd have paid by card”.
            <strong>8</strong> regulars are on your restock list.</p>
          ${ctaButton(L.billingPro, "See Vendl Pro")}
        `,
      ),
    },
    {
      label: "10 orders milestone",
      kind: "lifecycle_ten_orders",
      replyTo: emailReplyTo(),
      subject: `Congrats - 10 orders on ${APP_NAME}`,
      html: emailShell(
        "Congrats - 10 orders",
        `
          <p>Hi ${greetName(name)},</p>
          <p><strong>10 orders.</strong> That&apos;s past the &ldquo;just testing&rdquo; stage.</p>
          ${ctaButton(L.gallerySubmit, "Share your stand")}
          <p>Questions? <strong>hello@${APP_DOMAIN}</strong></p>
        `,
      ),
    },
    {
      label: "Cancel feedback",
      kind: "cancel_feedback",
      replyTo: emailReplyTo(),
      subject: `Thanks for trying ${APP_NAME} Pro`,
      html: emailShell(
        `Thanks for trying ${APP_NAME} Pro`,
        `
          <p>Hi ${greetName(name)},</p>
          <p>Sorry to see you leave <strong>${APP_NAME} Pro</strong>. Your account stays on
          <strong>Free ($0/mo)</strong>.</p>
          ${ctaButton(L.billingPro, "Upgrade to Pro anytime")}
        `,
      ),
    },
    {
      label: "Feature announce",
      kind: "announce_free_fee_pro_2026_08",
      replyTo: emailReplyTo(),
      subject: FEATURE_ANNOUNCE_SUBJECT,
      html: featureAnnounceHtml(name),
    },
    {
      label: "Stripe restricted nudge",
      kind: "lifecycle_stripe_restricted",
      replyTo: emailReplyTo(),
      subject: STRIPE_RESTRICTED_SUBJECT,
      html: stripeRestrictedHtml(name, [
        "Date of birth",
        "Bank account for payouts",
      ]),
    },
    {
      label: "Stripe never started nudge",
      kind: "lifecycle_stripe_never_started",
      replyTo: emailReplyTo(),
      subject: STRIPE_NEVER_STARTED_SUBJECT,
      html: stripeNeverStartedHtml(name),
    },
    {
      label: "Pro lapse cash fallback",
      kind: "pro_lapse_cash_fallback",
      subject: `${APP_NAME}: Cash enabled so checkout still works`,
      html: `<p>Your <strong>Pro</strong> access ended and you&apos;re on <strong>Free</strong>
        ($0/mo). At least one stand had no payment method turned on.</p>
        <p>We turned on <strong>Cash</strong> for: Green Valley Eggs
        so customers scanning your QR can still check out.</p>
        <p><a href="${L.billingPro}">Upgrade to Pro</a></p>`,
    },
    {
      label: "Waitlist confirm (customer)",
      kind: "waitlist_confirm",
      subject: `Thanks for joining the Tap & Go waitlist for ${APP_NAME}`,
      html: `
        <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#182C1B">
          <p style="font-size:18px;font-weight:600">You're on the Tap &amp; Go waitlist</p>
          <p>Hi ${name},</p>
          <p>Thanks for joining the Tap &amp; Go waitlist for ${APP_NAME}.</p>
          <p style="font-size:12px;color:#56684F">From the ${APP_NAME} team</p>
        </div>`,
    },
    {
      label: "Waitlist admin notify",
      kind: "waitlist_admin",
      subject: `[${APP_NAME} waitlist] ${name}`,
      html: `<p><strong>${name}</strong> &lt;${to}&gt; joined the Tap &amp; Go waitlist.</p>`,
    },
    {
      label: "Contact form (admin)",
      kind: "contact_form",
      subject: `[${APP_NAME} contact] General question`,
      html: `<p><strong>From:</strong> ${name} &lt;${to}&gt;</p>
        <p><strong>Subject:</strong> General question</p>
        <p><strong>Message:</strong></p>
        <p>Preview of a contact-form submission after the Vendl rebrand.</p>`,
    },
    {
      label: "Admin new signup",
      kind: "admin_new_signup",
      subject: `[${APP_NAME}] - New User Sign Up`,
      html: `
        <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#182C1B">
          <p style="font-size:18px;font-weight:600">New user signed up</p>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${to}</p>
          <p><strong>Plan:</strong> Free (all features; Vendl card fee)</p>
          <p style="margin:24px 0">
            <a href="${base}/admin/owners"
               style="background:#2E7D3F;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:600;display:inline-block">
              Open in admin
            </a>
          </p>
        </div>`,
    },
    {
      label: "Admin billing event",
      kind: "admin_billing_paid_subscribe",
      subject: `[${APP_NAME}] - Paid Pro subscribe`,
      html: `
        <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#182C1B">
          <p style="font-size:18px;font-weight:600">Paid Pro subscribe</p>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${to}</p>
          <p><strong>Plan:</strong> free → pro</p>
          <p><a href="${base}/admin/owners">Open in admin</a></p>
        </div>`,
    },
  ];
}

async function main() {
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    process.env.NEXT_PUBLIC_APP_URL = `https://${APP_DOMAIN}`;
  }
  const jobs = buildJobs();
  console.log(`Email audit: ${jobs.length} templates → ${to}`);
  console.log(`From fallback domain: ${APP_DOMAIN}`);
  console.log(`App base URL: ${appBaseUrl()}`);
  console.log(`EMAIL_FROM: ${cleanEnvSecret(process.env.EMAIL_FROM) ?? "(default)"}\n`);

  console.log("Catalog:");
  for (const [i, job] of jobs.entries()) {
    console.log(`  ${String(i + 1).padStart(2)}. [${job.kind}] ${job.label}`);
  }
  console.log("");

  for (const job of jobs) {
    try {
      await sendRaw(job);
      console.log(`OK  ${job.label}`);
      await new Promise((r) => setTimeout(r, 350));
    } catch (error) {
      console.error(`FAIL ${job.label}`, error);
    }
  }
  console.log("\nDone.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
