import { after } from "next/server";
import { PaymentStatus } from "@/generated/prisma/client";
import { APP_NAME } from "@/lib/constants";
import { escapeHtml } from "@/lib/lifecycle-emails/html";
import { mapPool } from "@/lib/map-pool";
import { sendOwnerEmail } from "@/lib/notify-email";
import { ownerAlertRecipients } from "@/lib/owner-alert-recipients";
import { prisma } from "@/lib/prisma";

type Sender = {
  ownerId: string;
  /** Reply-to when the owner has no alert email set (the signed-in user's email). */
  fallbackReplyTo: string | null;
};
type Message = { subject: string; message: string };

const EMAILABLE = [PaymentStatus.PAID, PaymentStatus.CUSTOMER_CONFIRMED];
const ownerInclude = { stand: { select: { name: true } }, owner: { include: { user: true } } } as const;

function emailHtml(standName: string, orderNumber: string, message: string) {
  const paragraphs = message
    .split(/\n+/)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");
  return `<p>From <strong>${escapeHtml(standName)}</strong> (order ${escapeHtml(orderNumber)})</p>
       ${paragraphs}
       <p style="font-size:12px;color:#56684F;margin-top:24px">Sent via ${APP_NAME}</p>`;
}

function cleanMessage(input: Message): Message | null {
  const subject = input.subject.trim().slice(0, 200);
  const message = input.message.trim().slice(0, 5000);
  return subject && message ? { subject, message } : null;
}

/** One email to one order's customer; replies go to the owner. */
export async function emailOrderCustomer(
  sender: Sender,
  input: Message & { orderId: string },
): Promise<{ ok: true } | { error: string }> {
  const text = cleanMessage(input);
  if (!text) return { error: "Subject and message are required." };

  const order = await prisma.order.findFirst({
    where: { id: input.orderId, ownerId: sender.ownerId, paymentStatus: { in: EMAILABLE } },
    include: ownerInclude,
  });
  if (!order?.receiptEmail) return { error: "This order has no customer email." };

  const replyTo = ownerAlertRecipients(order.owner)[0] ?? sender.fallbackReplyTo ?? undefined;
  try {
    await sendOwnerEmail(order.receiptEmail, text.subject, emailHtml(order.stand.name, order.orderNumber, text.message), {
      kind: "owner_to_customer",
      replyTo,
    });
  } catch (error) {
    console.error("Owner→customer email failed", error);
    return { error: "Could not send email. Try again." };
  }
  return { ok: true };
}

/** Emails every paid pre-order customer on the given orders (one pick-up group), in the background. */
export async function emailCollectionCustomers(
  sender: Sender,
  input: Message & { orderIds: string[] },
): Promise<{ ok: true; summary: string } | { error: string }> {
  const text = cleanMessage(input);
  if (!text) return { error: "Subject and message are required." };
  const orderIds = [...new Set(input.orderIds)].slice(0, 200);
  if (orderIds.length === 0) return { error: "No orders selected." };

  const orders = await prisma.order.findMany({
    where: { id: { in: orderIds }, ownerId: sender.ownerId, isPreOrder: true, paymentStatus: { in: EMAILABLE } },
    include: ownerInclude,
    orderBy: { createdAt: "asc" },
  });
  const withEmail = orders.filter((o) => o.receiptEmail);
  if (withEmail.length === 0) return { error: "No customer emails for this pre-order page." };

  const replyTo = ownerAlertRecipients(withEmail[0]!.owner)[0] ?? sender.fallbackReplyTo ?? undefined;
  const payload = withEmail.map((order) => ({
    email: order.receiptEmail!,
    standName: order.stand.name,
    orderNumber: order.orderNumber,
  }));
  const skipped = orders.length - withEmail.length;

  after(() =>
    mapPool(payload, 5, async (row) => {
      try {
        await sendOwnerEmail(row.email, text.subject, emailHtml(row.standName, row.orderNumber, text.message), {
          kind: "owner_to_customer_bulk",
          replyTo,
        });
      } catch (error) {
        console.error("Bulk owner→customer email failed", row.orderNumber, error);
      }
    }).catch((error) => {
      console.error("Bulk collection emails failed", error);
    }),
  );

  const parts = [`Emails queued to ${payload.length}`];
  if (skipped) parts.push(`${skipped} had no email`);
  return { ok: true, summary: parts.join(", ") + "." };
}
