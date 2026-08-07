import { APP_DOMAIN, APP_NAME } from "@/lib/constants";
import { appBaseUrl } from "@/lib/app-url";
import { prisma } from "@/lib/prisma";
import { sendOwnerEmail } from "@/lib/notify-email";
import { SubStatus } from "@/generated/prisma/client";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Send restock emails to ACTIVE subscribers. Returns recipient count. Never exposes emails. */
export async function sendRestockNotifications(input: {
  standId: string;
  standName: string;
  standSlug: string;
  sentByUserId: string;
  ownerMessage?: string;
}): Promise<{ recipientCount: number }> {
  const subscribers = await prisma.restockSubscriber.findMany({
    where: { standId: input.standId, status: SubStatus.ACTIVE },
    select: { email: true, unsubToken: true },
  });

  const base = appBaseUrl();
  const standUrl = `${base}/s/${encodeURIComponent(input.standSlug)}`;
  const safeName = escapeHtml(input.standName);
  const messageHtml = input.ownerMessage?.trim()
    ? `<p>${escapeHtml(input.ownerMessage.trim()).replace(/\n/g, "<br>")}</p>`
    : "";

  let sent = 0;
  for (const sub of subscribers) {
    const unsubUrl = `${base}/unsubscribe/restock?token=${encodeURIComponent(sub.unsubToken)}`;
    const listUnsubUrl = `${base}/api/restock/unsubscribe?token=${encodeURIComponent(sub.unsubToken)}`;
    const html = `
<p><strong>${safeName}</strong> just restocked — come grab what’s back.</p>
${messageHtml}
<p><a href="${standUrl}">Buy now</a></p>
<p style="font-size:13px;color:#5a6b5c;margin-top:24px">
  You asked ${APP_NAME} to email you when this stand restocks.
  <a href="${unsubUrl}">Unsubscribe</a>
</p>`;

    try {
      await sendOwnerEmail(
        sub.email,
        `${input.standName} just restocked — shop now`,
        html,
        {
          replyTo: `${APP_NAME} <hello@${APP_DOMAIN}>`,
          kind: "restock",
          headers: {
            "List-Unsubscribe": `<${listUnsubUrl}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
        },
      );
      sent += 1;
    } catch (error) {
      console.error(`[${APP_NAME}] restock email failed`, {
        standId: input.standId,
        error,
      });
    }
  }

  await prisma.restockNotification.create({
    data: {
      standId: input.standId,
      sentByUserId: input.sentByUserId,
      recipientCount: sent,
    },
  });

  return { recipientCount: sent };
}
