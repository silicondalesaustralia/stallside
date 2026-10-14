import { APP_NAME } from "@/lib/constants";
import { sendOwnerEmail } from "@/lib/notify-email";
import { escapeHtml } from "@/lib/lifecycle-emails/html";
import { prisma } from "@/lib/prisma";

type ShipmentEmailKind = "shipped" | "delivered";

/** Email the buyer that their order has shipped (with tracking) or been delivered. Returns false when there's no email. */
export async function notifyOrderShipment(orderId: string, kind: ShipmentEmailKind): Promise<boolean> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { stand: { select: { name: true } }, items: { select: { quantity: true, productNameSnapshot: true } } },
  });
  if (!order?.receiptEmail) return false;

  const greet = order.customerName ? `Hi ${escapeHtml(order.customerName)},` : "Hi,";
  const lines = order.items
    .map((i) => `<li>${escapeHtml(String(i.quantity))}× ${escapeHtml(i.productNameSnapshot)}</li>`)
    .join("");
  const shop = escapeHtml(order.stand.name);
  const tracking =
    kind === "shipped" && (order.trackingNumber || order.trackingUrl)
      ? `<p><strong>${escapeHtml(order.shippingCarrier ?? "Tracking")}</strong>${
          order.trackingNumber ? `: ${escapeHtml(order.trackingNumber)}` : ""
        }</p>${
          order.trackingUrl
            ? `<p><a href="${escapeHtml(order.trackingUrl)}">Track your parcel</a></p>`
            : ""
        }`
      : "";
  const lead =
    kind === "shipped"
      ? `<p>Good news - your order from <strong>${shop}</strong> is on its way.</p>`
      : `<p>Your order from <strong>${shop}</strong> has been delivered. Enjoy!</p>`;
  const subject = kind === "shipped" ? `Your order has shipped · ${order.stand.name}` : `Your order was delivered · ${order.stand.name}`;

  await sendOwnerEmail(
    order.receiptEmail,
    `[${APP_NAME}] ${subject}`,
    `<p>${greet}</p>
     ${lead}
     <p><strong>Order ${escapeHtml(order.orderNumber)}</strong></p>
     <ul>${lines}</ul>
     ${tracking}
     <p style="font-size:12px;color:#56684F">Questions? Reply to ${shop} directly.</p>`,
    { kind: "order_customer" },
  );
  return true;
}
