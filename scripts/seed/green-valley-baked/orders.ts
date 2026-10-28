import { MARK, type Db, type Scope } from "./context";
import type { Catalogue } from "./catalogue";
import type { CustomerRef } from "./customers";
import type { Selling } from "./selling";
import { planOrders, type DraftOrder } from "./order-plan";

export type SeededOrder = { id: string; draft: DraftOrder };

const STOCK_SOURCE = { CARD: "ORDER_CARD", CASH: "ORDER_CASH", LOCAL_TRANSFER: "ORDER_LOCAL_TRANSFER" } as const;

/** Card fees are marked synced so the order-fees cron never picks these orders up. */
function cardFee(totalCents: number): number {
  return Math.round(totalCents * 0.029) + 30;
}

export async function seedOrders(
  db: Db,
  scope: Scope,
  cat: Catalogue,
  customers: CustomerRef[],
  selling: Selling,
): Promise<SeededOrder[]> {
  const { ownerId, standId, currency, orderPrefix } = scope;
  const drafts = planOrders(cat, customers).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  const subs = await db.shopperSubscription.findMany({
    where: { ownerId, offerId: { in: [selling.weeklyOfferId, selling.clubOfferId] } },
    select: { id: true, customerEmail: true },
  });
  const subByEmail = new Map(subs.map((s) => [s.customerEmail, s.id]));
  const stock = new Map<string, number>();
  for (const p of [cat.focaccia, cat.cookies]) {
    const row = await db.product.findUniqueOrThrow({ where: { id: p.id }, select: { stockQuantity: true } });
    stock.set(p.id, row.stockQuantity);
  }

  const seeded: SeededOrder[] = [];
  for (const [i, d] of drafts.entries()) {
    const items = d.lines.map((l) => {
      const unit = l.unitCents ?? l.product.priceCents;
      return { productId: l.product.id, productNameSnapshot: l.product.name, quantity: l.quantity, unitPriceCents: unit, lineTotalCents: unit * l.quantity };
    });
    const subtotal = items.reduce((s, it) => s + it.lineTotalCents, 0);
    const discount = d.discount ? 200 : 0;
    const total = subtotal - discount;
    const cancelled = d.status === "CANCELLED";
    const isPreOrder = d.channel === "preorder" || d.channel === "subscription" || d.channel === "membership";
    const card = d.method === "CARD";
    const orderNumber = `${orderPrefix}${String(i + 1).padStart(4, "0")}`;
    const order = await db.order.create({
      data: {
        standId, ownerId, orderNumber, currency, createdAt: d.createdAt,
        paymentMethod: d.method,
        paymentStatus: cancelled ? "CANCELLED" : card ? "PAID" : "CUSTOMER_CONFIRMED",
        localTransferMethodId: d.method === "LOCAL_TRANSFER" ? "payid" : null,
        saleOrigin: d.channel === "stall" ? "FARM_STAND" : "VENDL_WEB",
        subtotalCents: subtotal, discountCents: discount, totalCents: total,
        discountLabel: discount ? "FOCACCIA2" : null,
        promotionId: discount ? selling.focaccia2Id : null,
        promotionCodeSnapshot: discount ? "FOCACCIA2" : null,
        processorFeeCents: card ? cardFee(total) : null,
        processorFeeCurrency: card ? currency : null,
        processorFeesSyncedAt: card ? d.createdAt : null,
        customerId: d.customer?.id ?? null,
        customerName: d.customer?.name ?? null,
        customerPhone: d.customer?.phone ?? null,
        receiptEmail: d.customer?.email ?? null,
        receiptChannel: d.customer ? "EMAIL" : "NONE",
        isPreOrder,
        collectionAt: d.collectionAt,
        collectionNote: isPreOrder ? "Bakery door, 9am-12pm" : null,
        collectionStatus: isPreOrder && !cancelled ? (d.status as "COLLECTED" | "READY" | "ORDERED") : null,
        paymentTiming: isPreOrder ? "PAY_UPFRONT" : "PAY_NOW",
        shopperSubscriptionId: d.subscriberEmail ? (subByEmail.get(d.subscriberEmail) ?? null) : null,
        items: { create: items },
      },
      select: { id: true },
    });
    seeded.push({ id: order.id, draft: d });
    if (cancelled) continue;
    for (const it of items) {
      const prev = stock.get(it.productId) ?? 0;
      const next = prev - it.quantity;
      stock.set(it.productId, next);
      await db.inventoryAdjustment.create({
        data: {
          productId: it.productId, ownerId, standId, orderId: order.id, changeQuantity: -it.quantity,
          previousQuantity: prev, newQuantity: next, reason: `Order ${orderNumber} ${MARK}`,
          source: STOCK_SOURCE[d.method], createdAt: d.createdAt,
        },
      });
    }
  }
  for (const [productId, qty] of stock) {
    await db.product.update({ where: { id: productId }, data: { stockQuantity: qty } });
  }
  console.log(`Orders: ${seeded.length}; stock now`, Object.fromEntries(stock));
  return seeded;
}
