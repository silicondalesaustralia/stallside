import { APP_NAME } from "@/lib/constants";
import { formatMoney } from "@/lib/money";
import { sendOwnerEmail } from "@/lib/notify-email";
import { escapeHtml } from "@/lib/lifecycle-emails/html";
import { formatCollectionLabel } from "@/lib/pre-order";
import { prisma } from "@/lib/prisma";

/** Email the buyer a receipt / pre-order confirmation after payment. */
export async function notifyOrderCustomer(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { stand: true, items: true },
  });
  if (!order?.receiptEmail) return;

  const total = formatMoney(order.totalCents, order.currency);
  const lines = order.items
    .map(
      (i) =>
        `<li>${escapeHtml(String(i.quantity))}× ${escapeHtml(i.productNameSnapshot)}</li>`,
    )
    .join("");
  const collect =
    order.isPreOrder && order.collectionAt
      ? `<p><strong>Collect:</strong> ${escapeHtml(formatCollectionLabel(order.collectionAt))}</p>`
      : "";
  const note = order.collectionNote
    ? `<p>${escapeHtml(order.collectionNote)}</p>`
    : "";
  const greet = order.customerName
    ? `Hi ${escapeHtml(order.customerName)},`
    : "Hi,";
  const title = order.isPreOrder
    ? `Pre-order confirmed · ${order.stand.name}`
    : `Order confirmed · ${order.stand.name}`;

  await sendOwnerEmail(
    order.receiptEmail,
    `[${APP_NAME}] ${title}`,
    `<p>${greet}</p>
     <p>Thanks for your order at <strong>${escapeHtml(order.stand.name)}</strong>.</p>
     <p><strong>Order ${escapeHtml(order.orderNumber)}</strong> · ${escapeHtml(total)}</p>
     <ul>${lines}</ul>
     ${collect}${note}
     <p style="font-size:12px;color:#56684F">Keep this email for your records.</p>`,
    { kind: "order_customer" },
  );
}
