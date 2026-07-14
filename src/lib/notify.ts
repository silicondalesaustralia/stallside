import { prisma } from "@/lib/prisma";
import { APP_NAME, LOW_STOCK_ALERT_COOLDOWN_HOURS } from "@/lib/constants";
import { formatMoney } from "@/lib/money";
import { sendOwnerEmail } from "@/lib/notify-email";
import { sendOwnerPush } from "@/lib/notify-push";

export async function notifySale(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      stand: true,
      items: true,
      owner: { include: { user: true } },
    },
  });
  if (!order) return;

  const to = order.owner.contactEmail || order.owner.user.email;
  if (!to) {
    console.error(`[${APP_NAME}] Sale notify skipped — no owner email`, orderId);
    return;
  }

  const total = formatMoney(order.totalCents, order.currency);
  const method = order.paymentMethod === "CASH" ? "Cash" : "Card";
  const lines = order.items
    .map((i) => `${i.quantity}× ${i.productNameSnapshot}`)
    .join(", ");
  const title = `Sale · ${order.stand.name}`;
  const body = `${method} ${total} — ${lines}`;

  // Await email (critical). Push is best-effort and must not block/fail the sale notify.
  await sendOwnerEmail(
    to,
    `[${APP_NAME}] ${title}`,
    `<p><strong>${title}</strong></p><p>${body}</p><p>Order ${order.orderNumber}</p>`,
  );
  await sendOwnerPush(order.ownerId, {
    title,
    body,
    data: { type: "sale", orderId: order.id },
  }).catch((error) => {
    console.error(`[${APP_NAME}] Sale push failed`, error);
  });

  await maybeNotifyLowStock(
    order.items.map((i) => i.productId),
    order.ownerId,
    order.standId,
    to,
  );
}

/** Call after manual inventory changes as well as sales. */
export async function notifyLowStockForProducts(
  productIds: string[],
  ownerId: string,
  standId: string,
  contactEmail: string,
) {
  await maybeNotifyLowStock(productIds, ownerId, standId, contactEmail);
}

async function maybeNotifyLowStock(
  productIds: string[],
  ownerId: string,
  standId: string,
  contactEmail: string,
) {
  if (!productIds.length) return;

  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { stand: true },
  });
  const since = new Date(
    Date.now() - LOW_STOCK_ALERT_COOLDOWN_HOURS * 60 * 60 * 1000,
  );

  for (const product of products) {
    if (product.stockQuantity > product.lowStockThreshold) continue;

    const recent = await prisma.lowStockAlert.findFirst({
      where: { productId: product.id, sentAt: { gte: since } },
    });
    if (recent) continue;

    const title = `Low stock · ${product.stand.name}`;
    const body = `${product.name}: ${product.stockQuantity} left (threshold ${product.lowStockThreshold})`;

    // Email first — only record the cooldown after a successful send.
    await sendOwnerEmail(
      contactEmail,
      `[${APP_NAME}] ${title}`,
      `<p><strong>${title}</strong></p><p>${body}</p>`,
    );

    await prisma.lowStockAlert.create({
      data: {
        productId: product.id,
        ownerId,
        standId,
        stockQuantityAtAlert: product.stockQuantity,
        threshold: product.lowStockThreshold,
        channel: "email+push",
      },
    });

    await sendOwnerPush(ownerId, {
      title,
      body,
      data: { type: "low_stock", productId: product.id },
    }).catch((error) => {
      console.error(`[${APP_NAME}] Low-stock push failed`, error);
    });
  }
}
