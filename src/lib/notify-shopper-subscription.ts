import { APP_NAME } from "@/lib/constants";
import { sendOwnerEmail } from "@/lib/notify-email";
import { escapeHtml } from "@/lib/lifecycle-emails/html";
import { subscriptionManageUrl } from "@/lib/subscription-offer";

export async function sendShopperSubscriptionWelcome(params: {
  to: string;
  customerName: string;
  offerTitle: string;
  standName: string;
  standSlug: string;
  manageToken: string;
}) {
  const manageUrl = subscriptionManageUrl(
    params.standSlug,
    params.manageToken,
  );
  const subject = `${params.offerTitle} · manage your ${APP_NAME} subscription`;
  const html = `
    <p>Hi ${escapeHtml(params.customerName)},</p>
    <p>You are subscribed to <strong>${escapeHtml(params.offerTitle)}</strong> from ${escapeHtml(params.standName)}.</p>
    <p><a href="${escapeHtml(manageUrl)}">Manage subscription</a> to update card, skip a cycle, pause, or cancel.</p>
    <p>Keep this email so you can return anytime.</p>
  `;
  await sendOwnerEmail(params.to, subject, html, {
    kind: "shopper_subscription_welcome",
  });
}
