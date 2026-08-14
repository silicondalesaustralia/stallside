import { prisma } from "@/lib/prisma";
import { APP_NAME } from "@/lib/constants";
import { appBaseUrl } from "@/lib/app-url";
import { sendOwnerEmail } from "@/lib/notify-email";
import { ownerAlertRecipients } from "@/lib/owner-alert-recipients";
import type { ChannelInterestKind } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";

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

  const pre = params.kind === "PREORDER";
  const label = pre ? "pre-orders" : "subscriptions";
  const setupPath = pre
    ? "/dashboard/pre-order-pages"
    : "/dashboard/subscriptions";
  const dashHref = `${appBaseUrl()}${setupPath}`;
  const title = `Customer wants ${label}`;
  const message = `${params.email} is interested in ${label} at ${stand.name}`;

  // Always create the in-app notification (email may still fail separately).
  await prisma.notification.create({
    data: {
      ownerId: stand.ownerId,
      standId: stand.id,
      type: "CHANNEL_INTEREST",
      status: "OPEN",
      title,
      message,
      metadata: {
        email: params.email,
        kind: params.kind,
        setupPath,
        dashHref,
      },
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/notifications");

  const recipients = ownerAlertRecipients(stand.owner);
  if (recipients.length) {
    const html = `
      <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#182C1B">
        <p style="font-size:18px;font-weight:600">${title} · ${stand.name}</p>
        <p><a href="mailto:${params.email}">${params.email}</a> said they would
        use <strong>${label}</strong> at <strong>${stand.name}</strong> if you
        offered them.</p>
        <p style="margin:24px 0">
          <a href="${dashHref}"
             style="background:#2E7D3F;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:600;display:inline-block">
            Set up ${label}
          </a>
        </p>
        <p style="font-size:13px;color:#5a6b5c">
          Also in your dashboard → Notifications.
        </p>
      </div>
    `;
    try {
      await sendOwnerEmail(recipients, `[${APP_NAME}] ${title} · ${stand.name}`, html, {
        kind: "channel_interest",
        replyTo: params.email,
      });
    } catch (error) {
      console.error(`[${APP_NAME}] channel interest email failed`, error);
    }
  } else {
    console.warn(
      `[${APP_NAME}] channel interest: no owner email recipients for stand ${stand.slug}`,
    );
  }

  return { ok: true as const };
}
