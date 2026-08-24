import { APP_NAME, PLATFORM_ADMIN_EMAILS } from "@/lib/constants";
import { appBaseUrl } from "@/lib/app-url";
import { escapeHtml } from "@/lib/lifecycle-emails/html";
import { contactInbox, sendOwnerEmail } from "@/lib/notify-email";
import { sendOwnerPush } from "@/lib/notify-push";
import { prisma } from "@/lib/prisma";

/** Fan out every sale to platform admins (email + push), not just the stand owner. */
export async function notifyAdminSale(input: {
  orderId: string;
  orderNumber: string;
  ownerId: string;
  ownerEmail: string;
  ownerName: string;
  standName: string;
  title: string;
  body: string;
  /** Addresses already emailed as the stand owner for this sale. */
  alreadyEmailed: string[];
}) {
  const already = new Set(
    input.alreadyEmailed.map((e) => e.trim().toLowerCase()).filter(Boolean),
  );
  const adminEmails = contactInbox().filter((email) => !already.has(email));
  const seller = input.ownerEmail.trim() || input.ownerName.trim() || "seller";
  const adminUrl = `${appBaseUrl()}/admin/owners/${input.ownerId}`;

  if (adminEmails.length) {
    const html = `
      <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#182C1B">
        <p style="font-size:18px;font-weight:600">${escapeHtml(input.title)}</p>
        <p><strong>Seller:</strong> ${escapeHtml(input.ownerName || "-")}
          (${escapeHtml(input.ownerEmail || "-")})</p>
        <p><strong>Stand:</strong> ${escapeHtml(input.standName)}</p>
        <p>${escapeHtml(input.body)}</p>
        <p>Order ${escapeHtml(input.orderNumber)}</p>
        <p style="margin:24px 0">
          <a href="${adminUrl}"
             style="background:#2E7D3F;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:600;display:inline-block">
            Open seller in admin
          </a>
        </p>
      </div>
    `;
    await sendOwnerEmail(
      adminEmails,
      `[${APP_NAME}] ${input.title} · ${seller}`,
      html,
      {
        replyTo: input.ownerEmail.includes("@") ? input.ownerEmail : undefined,
        kind: "admin_sale",
      },
    ).catch((error) => {
      console.error(`[${APP_NAME}] Admin sale email failed`, error);
    });
  }

  const adminEmailsList = [...PLATFORM_ADMIN_EMAILS];
  const adminOwners = await prisma.owner.findMany({
    where: {
      deletedAt: null,
      id: { not: input.ownerId },
      OR: [
        { user: { email: { in: adminEmailsList } } },
        { contactEmail: { in: adminEmailsList, mode: "insensitive" } },
      ],
    },
    select: { id: true },
  });

  await Promise.all(
    adminOwners.map((admin) =>
      sendOwnerPush(admin.id, {
        title: input.title,
        body: `${seller} · ${input.body}`,
        data: { type: "admin_sale", orderId: input.orderId },
      }).catch((error) => {
        console.error(`[${APP_NAME}] Admin sale push failed`, error);
      }),
    ),
  );
}
