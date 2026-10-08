import { escapeHtml } from "@/lib/lifecycle-emails/html";
import { sendOwnerEmail } from "@/lib/notify-email";
import { subscriptionManageUrl } from "@/lib/subscription-offer";

export type BillingEmailSub = {
  customerName: string;
  customerEmail: string;
  manageToken: string;
  offer: { title: string };
  stand: { name: string; slug: string };
  owner: { contactEmail: string };
};

function manageLink(sub: BillingEmailSub): string {
  const url = subscriptionManageUrl(sub.stand.slug, sub.manageToken);
  return `<a href="${escapeHtml(url)}">update your card</a>`;
}

async function safeSend(to: string, subject: string, html: string, kind: string) {
  try {
    await sendOwnerEmail(to, subject, html, { kind });
  } catch (error) {
    console.error("Square subscription email failed", kind, error);
  }
}

/** First failed renewal: ask the shopper to update their card before we retry. */
export async function sendPaymentFailedEmail(sub: BillingEmailSub, retryAt: Date) {
  const html = `
    <p>Hi ${escapeHtml(sub.customerName)},</p>
    <p>We couldn't take this period's payment for <strong>${escapeHtml(sub.offer.title)}</strong> from ${escapeHtml(sub.stand.name)}.</p>
    <p>We'll try again on ${escapeHtml(retryAt.toLocaleDateString("en-AU"))}. To keep your subscription going, ${manageLink(sub)}.</p>
  `;
  await safeSend(
    sub.customerEmail,
    `Payment failed · ${sub.offer.title}`,
    html,
    "square_subscription_payment_failed",
  );
}

/** Retries exhausted: tell the shopper and the seller the subscription has ended. */
export async function sendBillingCancelledEmails(sub: BillingEmailSub) {
  const shopperHtml = `
    <p>Hi ${escapeHtml(sub.customerName)},</p>
    <p>Your subscription to <strong>${escapeHtml(sub.offer.title)}</strong> from ${escapeHtml(sub.stand.name)} has been cancelled because we couldn't take payment after several tries.</p>
    <p>You're welcome to sign up again anytime from the farm's page.</p>
  `;
  const sellerHtml = `
    <p>A subscriber's card kept failing, so Vendl cancelled their subscription.</p>
    <p><strong>${escapeHtml(sub.customerName)}</strong> (${escapeHtml(sub.customerEmail)}) · ${escapeHtml(sub.offer.title)}</p>
    <p>No further orders will be created for them.</p>
  `;
  await Promise.all([
    safeSend(
      sub.customerEmail,
      `Subscription cancelled · ${sub.offer.title}`,
      shopperHtml,
      "square_subscription_cancelled_shopper",
    ),
    safeSend(
      sub.owner.contactEmail,
      `Subscription cancelled after failed payments · ${sub.customerName}`,
      sellerHtml,
      "square_subscription_cancelled_seller",
    ),
  ]);
}
