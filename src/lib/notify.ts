import { prisma } from "@/lib/prisma";
import { APP_NAME, LOW_STOCK_ALERT_COOLDOWN_HOURS } from "@/lib/constants";
import { formatMoney } from "@/lib/money";
import { notifyAdminSale } from "@/lib/notify-admin-sale";
import { sendOwnerEmail } from "@/lib/notify-email";
import { sendOwnerPush } from "@/lib/notify-push";
import { ownerAlertRecipients } from "@/lib/owner-alert-recipients";
import { sendStockAlert } from "@/lib/notify-stock";
import { maybeSendFirstTenOrdersEmail } from "@/lib/lifecycle-emails/send-and-mark";

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
  const title = order.isPreOrder
    ? `Pre-order · ${order.stand.name}`
    : `Sale · ${order.stand.name}`;
  const collectBit =
    order.isPreOrder && order.collectionAt
      ? ` · collect ${order.collectionAt.toLocaleDateString(undefined, {
          weekday: "short",
          day: "numeric",
          month: "short",
        })}`
      : "";
  const nameBit = order.customerName ? ` · ${order.customerName}` : "";
  const emailBit = order.receiptEmail ? ` · ${order.receiptEmail}` : "";
  const body = `${method} ${total} - ${lines}${collectBit}${nameBit}${emailBit}`;

  const emailedOwner = emailOn && recipients.length > 0;
  if (emailedOwner) {
    await sendOwnerEmail(
      recipients,
      `[${APP_NAME}] ${title}`,
      `<p><strong>${title}</strong></p><p>${body}</p><p>Order ${order.orderNumber}</p>`,
      { kind: "sale" },
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

  const ownerEmail =
    order.owner.contactEmail || order.owner.user?.email || "";
  await notifyAdminSale({
    orderId: order.id,
    orderNumber: order.orderNumber,
    ownerId: order.ownerId,
    ownerEmail,
    ownerName: order.owner.businessName,
    standName: order.stand.name,
    title,
    body,
    alreadyEmailed: emailedOwner ? recipients : [],
  });

  await maybeNotifyLowStock(
    order.items.map((i) => i.productId),
    order.ownerId,
    order.standId,
  );

  await maybeSendFirstTenOrdersEmail(order.ownerId).catch((error) => {
    console.error(`[${APP_NAME}] 10-order check failed`, error);
  });
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

  const candidates = products.filter((product) => {
    const soldOut = product.stockQuantity <= 0;
    return soldOut || product.stockQuantity <= product.lowStockThreshold;
  });
  if (!candidates.length) return;

  const recent = await prisma.lowStockAlert.findMany({
    where: {
      productId: { in: candidates.map((p) => p.id) },
      sentAt: { gte: since },
    },
    select: {
      productId: true,
      stockQuantityAtAlert: true,
    },
  });
  const recentSoldOut = new Set(
    recent.filter((r) => r.stockQuantityAtAlert <= 0).map((r) => r.productId),
  );
  const recentLow = new Set(
    recent.filter((r) => r.stockQuantityAtAlert > 0).map((r) => r.productId),
  );

  for (const product of candidates) {
    const soldOut = product.stockQuantity <= 0;
    if (soldOut) {
      if (recentSoldOut.has(product.id)) continue;
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

    if (recentLow.has(product.id)) continue;

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
