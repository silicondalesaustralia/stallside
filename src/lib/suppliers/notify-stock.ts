import { prisma } from "@/lib/prisma";
import { APP_NAME } from "@/lib/constants";
import { sendOwnerEmail } from "@/lib/notify-email";
import { sendOwnerPush } from "@/lib/notify-push";
import { ownerAlertRecipients } from "@/lib/owner-alert-recipients";

function formatWhen(at: Date, timeZone: string): string {
  try {
    return at.toLocaleString("en-AU", {
      timeZone,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return at.toLocaleString("en-AU");
  }
}

/** Tell the stand owner a supplier changed stock. Does not email the supplier. */
export async function notifySupplierStock(input: {
  ownerId: string;
  standId: string;
  standName: string;
  timezone: string;
  memberName: string;
  productId: string;
  productName: string;
  changeQuantity: number;
  at: Date;
}) {
  const owner = await prisma.owner.findUnique({
    where: { id: input.ownerId },
    select: {
      id: true,
      contactEmail: true,
      alertEmails: true,
      emailAlertsEnabled: true,
      pushAlertsEnabled: true,
      user: { select: { email: true } },
    },
  });
  if (!owner) return;

  const when = formatWhen(input.at, input.timezone);
  const title = `Stock · ${input.standName}`;
  const body =
    input.changeQuantity === 0
      ? `${input.memberName} listed ${input.productName} at ${when}`
      : `${input.memberName} ${input.changeQuantity >= 0 ? "added" : "removed"} ${Math.abs(input.changeQuantity)} ${input.productName} at ${when}`;

  if (owner.emailAlertsEnabled) {
    const recipients = ownerAlertRecipients(owner);
    if (recipients.length) {
      await sendOwnerEmail(
        recipients,
        `[${APP_NAME}] ${title}`,
        `<p><strong>${title}</strong></p><p>${body}</p>`,
        { kind: "supplier_stock" },
      );
    }
  }

  if (owner.pushAlertsEnabled) {
    await sendOwnerPush(owner.id, {
      title,
      body,
      data: { type: "supplier_stock", productId: input.productId },
    }).catch((error) => {
      console.error(`[${APP_NAME}] supplier stock push failed`, error);
    });
  }

  await prisma.notification.create({
    data: {
      ownerId: owner.id,
      standId: input.standId,
      type: "SUPPLIER_STOCK",
      status: "OPEN",
      title,
      message: body,
      metadata: {
        productId: input.productId,
        memberName: input.memberName,
        changeQuantity: input.changeQuantity,
      },
    },
  });
}
