"use server";

import { PaymentStatus } from "@/generated/prisma/client";
import { APP_NAME } from "@/lib/constants";
import { escapeHtml } from "@/lib/lifecycle-emails/html";
import { sendOwnerEmail } from "@/lib/notify-email";
import { ownerAlertRecipients } from "@/lib/owner-alert-recipients";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/session";

export async function sendOrderCustomerEmail(input: {
  orderId: string;
  subject: string;
  message: string;
}) {
  const { owner, user } = await requireOwner();

  const subject = input.subject.trim().slice(0, 200);
  const message = input.message.trim().slice(0, 5000);
  if (!subject || !message) {
    return { error: "Subject and message are required." };
  }

  const order = await prisma.order.findFirst({
    where: {
      id: input.orderId,
      ownerId: owner.id,
      paymentStatus: PaymentStatus.PAID,
    },
    include: {
      stand: { select: { name: true } },
      owner: { include: { user: true } },
    },
  });
  if (!order?.receiptEmail) {
    return { error: "This order has no customer email." };
  }

  const replyTo =
    ownerAlertRecipients(order.owner)[0] ?? user.email ?? undefined;
  const paragraphs = message
    .split(/\n+/)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");

  try {
    await sendOwnerEmail(
      order.receiptEmail,
      subject,
      `<p>From <strong>${escapeHtml(order.stand.name)}</strong> (order ${escapeHtml(order.orderNumber)})</p>
       ${paragraphs}
       <p style="font-size:12px;color:#56684F;margin-top:24px">Sent via ${APP_NAME}</p>`,
      {
        kind: "owner_to_customer",
        replyTo: replyTo ?? undefined,
      },
    );
  } catch (error) {
    console.error("Owner→customer email failed", error);
    return { error: "Could not send email. Try again." };
  }

  return { ok: true as const };
}
