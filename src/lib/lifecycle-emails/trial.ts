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

async function send(to: string, subject: string, html: string, kind: string) {
  await sendOwnerEmail(to, subject, html, { replyTo: emailReplyTo(), kind });
}

export async function sendTrialWelcome(r: Recipient) {
  const L = lifecycleLinks();
  const html = emailShell(
    `Welcome to ${APP_NAME}`,
    `
      <p>Hi ${greetName(r.name)},</p>
      <p>Thanks for joining ${APP_NAME}. Glad you&apos;re here.</p>
      <p><strong>Starter is free forever</strong> — cash, PayID (AU), products, options,
      stock, QR posters, and alerts. You also get a <strong>30-day Pro trial</strong>
      with Tap &amp; Go, pre-orders, branding, and restock notify. No card required.</p>
      <p><strong>Start here</strong></p>
      <ol>
        <li>Create your first stand</li>
        <li>Add a product and stock</li>
        <li>Print your QR sign</li>
        <li>Connect Stripe if you want Tap &amp; Go during the trial</li>
      </ol>
      ${ctaButton(L.newStand, "Create your first stand")}
      <p>After the trial you stay on Starter free forever unless you upgrade to Pro.</p>
      <p><a href="${L.billing}">See Pro pricing</a> · <a href="${L.knowledge}">Guides</a></p>
    `,
  );
  await send(r.to, `Welcome to ${APP_NAME} - let’s get your stand live`, html, "lifecycle_welcome");
}

export async function sendTrialDay7(r: Recipient) {
  const L = lifecycleLinks();
  const html = emailShell(
    `How’s ${APP_NAME} going?`,
    `
      <p>Hi ${greetName(r.name)},</p>
      <p>You&apos;ve had ${APP_NAME} for a week. How&apos;s it feeling at the stand?</p>
      <p>If something&apos;s confusing or missing, reply or email
      <strong>hello@stallside.app</strong>.</p>
      ${ctaButton(L.featureRequest, "Request a feature")}
      <p><a href="${L.knowledge}">Guides</a></p>
    `,
  );
  await send(r.to, `How’s ${APP_NAME} going?`, html, "lifecycle_day7");
}

export async function sendTrialDay14(r: Recipient) {
  const L = lifecycleLinks();
  const html = emailShell(
    "Halfway through your Pro trial",
    `
      <p>Hi ${greetName(r.name)},</p>
      <p>You&apos;re halfway through your 30-day <strong>Pro trial</strong>.</p>
      <p>Pro includes Tap &amp; Go, pre-orders, collections, restock emails, and branding.
      When the trial ends you stay on <strong>Starter free forever</strong> — nothing locks.</p>
      ${ctaButton(L.billing, "View Pro pricing")}
    `,
  );
  await send(r.to, `Halfway through your ${APP_NAME} Pro trial`, html, "lifecycle_day14");
}

/** Day ~23: what you'll keep vs what pauses. */
export async function sendTrialDay23(r: Recipient) {
  const L = lifecycleLinks();
  const html = emailShell(
    "Your Pro trial ends soon — here's what you'll keep",
    `
      <p>Hi ${greetName(r.name)},</p>
      <p>Your Pro trial ends in about a week.</p>
      <p><strong>You'll keep on Starter (free forever):</strong> cash &amp; PayID, products
      and options, stock, QR posters, sale &amp; low-stock alerts, order history.</p>
      <p><strong>Pauses without Pro:</strong> Tap &amp; Go, new pre-orders, branding on the
      public stall, sending restock emails. You can still fulfil paid pre-orders in
      Collections.</p>
      ${ctaButton(L.billing, "Upgrade to Pro")}
      <p>Questions? <strong>hello@stallside.app</strong></p>
    `,
  );
  await send(
    r.to,
    `Your ${APP_NAME} Pro trial ends soon — here's what you'll keep`,
    html,
    "lifecycle_day23",
  );
}

/** Kept for cron compatibility; prefer day 23. */
export async function sendTrialDay28(r: Recipient) {
  return sendTrialDay23(r);
}

export async function sendTrialDay30(r: Recipient) {
  const L = lifecycleLinks();
  const name = escapeHtml(r.businessName?.trim() || r.name.trim() || "there");
  const html = emailShell(
    "You're on Starter now",
    `
      <p>Hi ${name},</p>
      <p>Your Pro trial has ended. <strong>You're on Starter now. Nothing's lost.</strong></p>
      <p>Your stands, products, QR posters, and orders are still here. Cash and PayID
      keep working. Upgrade anytime for Tap &amp; Go, pre-orders, branding, and restock notify.</p>
      ${ctaButton(L.billing, "Upgrade to Pro")}
      <p>Not upgrading? A quick note helps us improve:
      <a href="${L.feedback}">Send feedback</a> or hello@stallside.app.</p>
    `,
  );
  await send(
    r.to,
    `You're on ${APP_NAME} Starter — nothing's lost`,
    html,
    "lifecycle_day30",
  );
}

/** Day 45: what Pro would have done. */
export async function sendTrialDay45(
  r: Recipient,
  stats?: { cardInterestCount?: number; restockCount?: number },
) {
  const L = lifecycleLinks();
  const cardN = stats?.cardInterestCount ?? 0;
  const restockN = stats?.restockCount ?? 0;
  const statsLine =
    cardN > 0 || restockN > 0
      ? `<p>Over the last two weeks on Starter:
         ${cardN > 0 ? `<strong>${cardN}</strong> shoppers tapped “I'd have paid by card”. ` : ""}
         ${restockN > 0 ? `<strong>${restockN}</strong> regulars are waiting on your restock list.` : ""}
         </p>`
      : `<p>Shoppers on Starter can still tell you they wanted card, and join your restock
         list — Pro is how you take the card and send the email.</p>`;
  const html = emailShell(
    "What Pro would have done",
    `
      <p>Hi ${greetName(r.name)},</p>
      <p>It&apos;s been a couple of weeks since your Pro trial ended.</p>
      ${statsLine}
      ${ctaButton(L.billing, "See Stallside Pro")}
    `,
  );
  await send(r.to, `What ${APP_NAME} Pro would have done`, html, "lifecycle_day45");
}
