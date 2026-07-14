import { prisma } from "@/lib/prisma";
import { APP_NAME, LOW_STOCK_ALERT_COOLDOWN_HOURS } from "@/lib/constants";
import { formatMoney } from "@/lib/money";
import { sendOwnerEmail } from "@/lib/notify-email";
import { sendOwnerPush } from "@/lib/notify-push";
import { ownerAlertRecipients } from "@/lib/owner-alert-recipients";
import { sendStockAlert } from "@/lib/notify-stock";

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

  const recipients = ownerAlertRecipients(order.owner);
  const emailOn = order.owner.emailAlertsEnabled;
  const pushOn = order.owner.pushAlertsEnabled;

  if (emailOn && !recipients.length) {
    console.error(`[${APP_NAME}] Sale notify skipped - no owner email`, orderId);
  }

  const total = formatMoney(order.totalCents, order.currency);
  const method =
    order.paymentMethod === "CASH"
      ? "Cash"
      : order.paymentMethod === "PAYPAL"
        ? "PayPal"
        : "Card";
  const lines = order.items
    .map((i) => `${i.quantity}× ${i.productNameSnapshot}`)
    .join(", ");
  const title = `Sale · ${order.stand.name}`;
  const body = `${method} ${total} - ${lines}`;

  if (emailOn && recipients.length) {
    await sendOwnerEmail(
      recipients,
      `[${APP_NAME}] ${title}`,
      `<p><strong>${title}</strong></p><p>${body}</p><p>Order ${order.orderNumber}</p>`,
    );
  }
  if (pushOn) {
    await sendOwnerPush(order.ownerId, {
      title,
      body,
      data: { type: "sale", orderId: order.id },
    }).catch((error) => {
      console.error(`[${APP_NAME}] Sale push failed`, error);
    });
  }

  await maybeNotifyLowStock(
    order.items.map((i) => i.productId),
    order.ownerId,
    order.standId,
  );
}

export async function notifyLowStockForProducts(
  productIds: string[],
  ownerId: string,
  standId: string,
) {
  await maybeNotifyLowStock(productIds, ownerId, standId);
}

async function maybeNotifyLowStock(
  productIds: string[],
  ownerId: string,
  standId: string,
) {
  if (!productIds.length) return;

  const owner = await prisma.owner.findUnique({
    where: { id: ownerId },
    include: { user: true },
  });
  if (!owner) return;
  if (!owner.emailAlertsEnabled && !owner.pushAlertsEnabled) return;

  const recipients = ownerAlertRecipients(owner);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { stand: true },
  });
  const since = new Date(
    Date.now() - LOW_STOCK_ALERT_COOLDOWN_HOURS * 60 * 60 * 1000,
  );

  for (const product of products) {
    const soldOut = product.stockQuantity <= 0;
    if (!soldOut && product.stockQuantity > product.lowStockThreshold) continue;

    if (soldOut) {
      const recentSoldOut = await prisma.lowStockAlert.findFirst({
        where: {
          productId: product.id,
          sentAt: { gte: since },
          stockQuantityAtAlert: { lte: 0 },
        },
      });
      if (recentSoldOut) continue;

      await sendStockAlert({
        owner,
        recipients,
        standId,
        product,
        title: `Sold out · ${product.stand.name}`,
        body: `${product.name} is sold out. Restock when you can.`,
        channel: "sold_out",
        type: "sold_out",
      });
      continue;
    }

    const recentLow = await prisma.lowStockAlert.findFirst({
      where: {
        productId: product.id,
        sentAt: { gte: since },
        stockQuantityAtAlert: { gt: 0 },
      },
    });
    if (recentLow) continue;

    await sendStockAlert({
      owner,
      recipients,
      standId,
      product,
      title: `Low stock · ${product.stand.name}`,
      body: `${product.name}: ${product.stockQuantity} left (threshold ${product.lowStockThreshold})`,
      channel: "low_stock",
      type: "low_stock",
    });
  }
}
