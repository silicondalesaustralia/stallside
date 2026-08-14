import { prisma } from "@/lib/prisma";
import { APP_NAME } from "@/lib/constants";
import { appBaseUrl } from "@/lib/app-url";
import { sendOwnerEmail } from "@/lib/notify-email";
import { ownerAlertRecipients } from "@/lib/owner-alert-recipients";
import type { ChannelInterestKind } from "@/generated/prisma/client";

export async function notifyChannelInterest(params: {
  standSlug: string;
  kind: ChannelInterestKind;
  email: string;
}) {
  const stand = await prisma.stand.findUnique({
    where: { slug: params.standSlug },
    include: { owner: { include: { user: true } } },
  });
  if (!stand || !stand.isActive) {
    return { error: "Stand not found." as const };
  }

  const recipients = ownerAlertRecipients(stand.owner);
  if (!stand.owner.emailAlertsEnabled || !recipients.length) {
    return { ok: true as const };
  }

  const pre = params.kind === "PREORDER";
  const label = pre ? "pre-orders" : "subscriptions";
  const dashHref = pre
    ? `${appBaseUrl()}/dashboard/pre-order-pages`
    : `${appBaseUrl()}/dashboard/subscriptions`;
  const title = `Customer wants ${label} · ${stand.name}`;
  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#182C1B">
      <p style="font-size:18px;font-weight:600">${title}</p>
      <p><a href="mailto:${params.email}">${params.email}</a> said they would
      use <strong>${label}</strong> at <strong>${stand.name}</strong> if you
      offered them.</p>
      <p style="margin:24px 0">
        <a href="${dashHref}"
           style="background:#2E7D3F;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:600;display:inline-block">
          Set up ${label}
        </a>
      </p>
    </div>
  `;

  await sendOwnerEmail(recipients, `[${APP_NAME}] ${title}`, html, {
    kind: "channel_interest",
  });

  // Create in-app notification
  await prisma.notification.create({
    data: {
      ownerId: stand.ownerId,
      standId: stand.id,
      type: "CHANNEL_INTEREST",
      title: `Customer wants ${label}`,
      message: `${params.email} is interested in ${label} at ${stand.name}`,
      metadata: {
        email: params.email,
        kind: params.kind,
        dashHref,
      },
    },
  });

  return { ok: true as const };
}
