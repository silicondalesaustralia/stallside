import { prisma } from "@/lib/prisma";
import { APP_DOMAIN, APP_NAME } from "@/lib/constants";
import { appBaseUrl } from "@/lib/app-url";
import { sendOwnerEmail } from "@/lib/notify-email";

/** Customer asked to notify the owner they’d use Tap & Go or PayPal if enabled. */
export async function notifyTapAndGoInterest(standSlug: string) {
  const stand = await prisma.stand.findUnique({
    where: { slug: standSlug },
    include: { owner: { include: { user: true } } },
  });
  if (!stand || !stand.isActive) {
    return { error: "Stand not found." as const };
  }

  const to = stand.owner.contactEmail || stand.owner.user.email;
  if (!to) {
    return { error: "Could not reach the stand owner." as const };
  }

  const settingsUrl = `${appBaseUrl()}/dashboard/settings`;
  const stripeUrl = `${appBaseUrl()}/dashboard/settings/stripe`;
  const paypalUrl = `${appBaseUrl()}/dashboard/settings/paypal`;
  const title = `Customer wants Tap & Go or PayPal · ${stand.name}`;
  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#182C1B">
      <p style="font-size:18px;font-weight:600">${title}</p>
      <p>A customer who just paid at <strong>${stand.name}</strong> said they would use
      <strong>Tap &amp; Go</strong> (card, Apple Pay, Google Pay) or <strong>PayPal</strong>
      if available - at this stand and others on ${APP_NAME}.</p>
      <p style="margin-top:20px;font-weight:600">How to turn digital payments on</p>
      <ol>
        <li>Sign in on the ${APP_NAME} owner app, or at
          <a href="https://${APP_DOMAIN}">${APP_DOMAIN}</a></li>
        <li>Go to <strong>Settings</strong></li>
        <li>Connect <strong>Stripe</strong> for Tap &amp; Go, and/or <strong>PayPal</strong>
          for PayPal checkout</li>
        <li>Follow the on-screen instructions to finish setup</li>
      </ol>
      <p style="margin:24px 0">
        <a href="${stripeUrl}"
           style="background:#2E7D3F;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:600;margin-right:8px;display:inline-block">
          Open Stripe settings
        </a>
        <a href="${paypalUrl}"
           style="background:#003087;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:600;display:inline-block">
          Open PayPal settings
        </a>
      </p>
      <p style="font-size:14px;color:#5a6b5c">
        Or open <a href="${settingsUrl}">Settings</a> to see both options.
      </p>
    </div>
  `;

  await sendOwnerEmail(to, `[${APP_NAME}] ${title}`, html);
  return { ok: true as const };
}
