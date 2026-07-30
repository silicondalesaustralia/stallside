"use server";

import { PaymentStatus } from "@/generated/prisma/client";
import { APP_NAME } from "@/lib/constants";
import { escapeHtml } from "@/lib/lifecycle-emails/html";
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

/** YYYY-MM-DD from collectionAt.toISOString() — matches Collections grouping. */
export async function sendCollectionDayCustomerEmails(input: {
  collectionDayKey: string;
  subject: string;
  message: string;
}) {
  const { owner, user } = await requireOwner();

  const subject = input.subject.trim().slice(0, 200);
  const message = input.message.trim().slice(0, 5000);
  if (!subject || !message) {
    return { error: "Subject and message are required." };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.collectionDayKey)) {
    return { error: "Invalid collection day." };
  }

  const start = new Date(`${input.collectionDayKey}T00:00:00.000Z`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  const orders = await prisma.order.findMany({
    where: {
      ownerId: owner.id,
      isPreOrder: true,
      paymentStatus: PaymentStatus.PAID,
      collectionAt: { gte: start, lt: end },
    },
    include: {
      stand: { select: { name: true } },
      owner: { include: { user: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const withEmail = orders.filter((o) => o.receiptEmail);
  if (withEmail.length === 0) {
    return { error: "No customer emails for this collection day." };
  }

  const replyTo =
    ownerAlertRecipients(withEmail[0]!.owner)[0] ?? user.email ?? undefined;

  let sent = 0;
  let failed = 0;
  for (const order of withEmail) {
    try {
      await sendOwnerEmail(
        order.receiptEmail!,
        subject,
        emailHtml(order.stand.name, order.orderNumber, message),
        {
          kind: "owner_to_customer_bulk",
          replyTo: replyTo ?? undefined,
        },
      );
      sent += 1;
    } catch (error) {
      console.error("Bulk owner→customer email failed", order.id, error);
      failed += 1;
    }
  }

  if (sent === 0) {
    return { error: "Could not send emails. Try again." };
  }

  const skipped = orders.length - withEmail.length;
  const parts = [`Sent to ${sent}`];
  if (failed) parts.push(`${failed} failed`);
  if (skipped) parts.push(`${skipped} had no email`);
  return { ok: true as const, summary: parts.join(", ") + "." };
}
