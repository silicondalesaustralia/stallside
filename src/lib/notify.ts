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
    console.error(`[${APP_NAME}] Sale notify skipped - no owner email`, orderId);
    return;
  }

  const total = formatMoney(order.totalCents, order.currency);
  const method = order.paymentMethod === "CASH" ? "Cash" : "Card";
  const lines = order.items
    .map((i) => `${i.quantity}× ${i.productNameSnapshot}`)
    .join(", ");
  const title = `Sale · ${order.stand.name}`;
  const body = `${method} ${total} - ${lines}`;

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
    const soldOut = product.stockQuantity <= 0;
    if (!soldOut && product.stockQuantity > product.lowStockThreshold) continue;

    if (soldOut) {
      // Sold out is its own event - a prior "low stock" alert must not suppress it.
      const recentSoldOut = await prisma.lowStockAlert.findFirst({
        where: {
          productId: product.id,
          sentAt: { gte: since },
          stockQuantityAtAlert: { lte: 0 },
        },
      });
      if (recentSoldOut) continue;

      const title = `Sold out · ${product.stand.name}`;
      const body = `${product.name} is sold out. Restock when you can.`;
      await sendStockAlert({
        to: contactEmail,
        ownerId,
        standId,
        product,
        title,
        body,
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

    const title = `Low stock · ${product.stand.name}`;
    const body = `${product.name}: ${product.stockQuantity} left (threshold ${product.lowStockThreshold})`;
    await sendStockAlert({
      to: contactEmail,
      ownerId,
      standId,
      product,
      title,
      body,
      channel: "low_stock",
      type: "low_stock",
    });
  }
}

async function sendStockAlert(input: {
  to: string;
  ownerId: string;
  standId: string;
  product: { id: string; stockQuantity: number; lowStockThreshold: number };
  title: string;
  body: string;
  channel: string;
  type: "sold_out" | "low_stock";
}) {
  await sendOwnerEmail(
    input.to,
    `[${APP_NAME}] ${input.title}`,
    `<p><strong>${input.title}</strong></p><p>${input.body}</p>`,
  );

  await prisma.lowStockAlert.create({
    data: {
      productId: input.product.id,
      ownerId: input.ownerId,
      standId: input.standId,
      stockQuantityAtAlert: input.product.stockQuantity,
      threshold: input.product.lowStockThreshold,
      channel: input.channel,
    },
  });

  await sendOwnerPush(input.ownerId, {
    title: input.title,
    body: input.body,
    data: { type: input.type, productId: input.product.id },
  }).catch((error) => {
    console.error(`[${APP_NAME}] ${input.type} push failed`, error);
  });
}
