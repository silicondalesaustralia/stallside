"use server";

import { after } from "next/server";
import { PaymentStatus } from "@/generated/prisma/client";
import { APP_NAME } from "@/lib/constants";
import { escapeHtml } from "@/lib/lifecycle-emails/html";
import { mapPool } from "@/lib/map-pool";
import { sendOwnerEmail } from "@/lib/notify-email";
import { ownerAlertRecipients } from "@/lib/owner-alert-recipients";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/session";

function emailHtml(standName: string, orderNumber: string, message: string) {
  const paragraphs = message
    .split(/\n+/)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");
  return `<p>From <strong>${escapeHtml(standName)}</strong> (order ${escapeHtml(orderNumber)})</p>
       ${paragraphs}
       <p style="font-size:12px;color:#56684F;margin-top:24px">Sent via ${APP_NAME}</p>`;
}

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

  try {
    await sendOwnerEmail(
      order.receiptEmail,
      subject,
      emailHtml(order.stand.name, order.orderNumber, message),
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

/** Email paid customers on a specific Collections group (one pre-order page). */
export async function sendCollectionGroupCustomerEmails(input: {
  orderIds: string[];
  subject: string;
  message: string;
}) {
  const { owner, user } = await requireOwner();

  const subject = input.subject.trim().slice(0, 200);
  const message = input.message.trim().slice(0, 5000);
  if (!subject || !message) {
    return { error: "Subject and message are required." };
  }
  const orderIds = [...new Set(input.orderIds)].slice(0, 200);
  if (orderIds.length === 0) {
    return { error: "No orders selected." };
  }

  const orders = await prisma.order.findMany({
    where: {
      id: { in: orderIds },
      ownerId: owner.id,
      isPreOrder: true,
      paymentStatus: PaymentStatus.PAID,
    },
    include: {
      stand: { select: { name: true } },
      owner: { include: { user: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const withEmail = orders.filter((o) => o.receiptEmail);
  if (withEmail.length === 0) {
    return { error: "No customer emails for this pre-order page." };
  }

  const replyTo =
    ownerAlertRecipients(withEmail[0]!.owner)[0] ?? user.email ?? undefined;

  const payload = withEmail.map((order) => ({
    email: order.receiptEmail!,
    standName: order.stand.name,
    orderNumber: order.orderNumber,
  }));
  const skipped = orders.length - withEmail.length;

  after(() => {
    void mapPool(payload, 5, async (row) => {
      try {
        await sendOwnerEmail(
          row.email,
          subject,
          emailHtml(row.standName, row.orderNumber, message),
          {
            kind: "owner_to_customer_bulk",
            replyTo: replyTo ?? undefined,
          },
        );
      } catch (error) {
        console.error("Bulk owner→customer email failed", row.orderNumber, error);
      }
    }).catch((error) => {
      console.error("Bulk collection emails failed", error);
    });
  });

  const parts = [`Emails queued to ${payload.length}`];
  if (skipped) parts.push(`${skipped} had no email`);
  return { ok: true as const, summary: parts.join(", ") + "." };
}
