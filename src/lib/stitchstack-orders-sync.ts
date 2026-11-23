import { PaymentStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { channelName, paymentMethodName } from "@/lib/order-export/labels";
import { orderProfitFromParts } from "@/lib/order-profit";
import { STITCHSTACK_APP_URL } from "@/lib/stitchstack";

const BATCH = 200;

type SlimOrder = {
  order_id: string;
  order_number: string;
  total: number;
  currency: string;
  status: string;
  channel: string;
  payment_method: string;
  occurred_at: string;
  customer_name: string | null;
  tax: number;
  fees: number;
  cogs: number;
  profit: number;
  cost_incomplete: boolean;
  items: Array<{
    line_id: string;
    product_id: string;
    name: string;
    quantity: number;
    total: number;
    unit_cost: number | null;
  }>;
};

function partnerApiKey(): string | null {
  return process.env.STITCHSTACK_PARTNER_API_KEY?.trim() || process.env.VENDL_PARTNER_API_KEY?.trim() || null;
}

function centsToMoney(cents: number) {
  return Math.round(cents) / 100;
}

async function loadOrderBatch(
  ownerId: string,
  cursor: string | null,
  since: Date | null,
): Promise<SlimOrder[]> {
  const rows = await prisma.order.findMany({
    where: {
      ownerId,
      paymentStatus: {
        in: [
          PaymentStatus.PAID,
          PaymentStatus.DEPOSIT_PAID,
          PaymentStatus.CUSTOMER_CONFIRMED,
          PaymentStatus.REFUNDED,
        ],
      },
      ...(since ? { updatedAt: { gte: since } } : {}),
    },
    orderBy: { id: "asc" },
    take: BATCH,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    select: {
      id: true,
      orderNumber: true,
      totalCents: true,
      gstCents: true,
      platformFeeCents: true,
      processorFeeCents: true,
      currency: true,
      paymentStatus: true,
      paymentMethod: true,
      localTransferMethodId: true,
      createdAt: true,
      customerName: true,
      isPreOrder: true,
      shopperSubscriptionId: true,
      items: {
        select: {
          id: true,
          productId: true,
          productNameSnapshot: true,
          quantity: true,
          lineTotalCents: true,
          supplierUnitCents: true,
          product: { select: { costCents: true } },
        },
      },
    },
  });

  return rows.map((row) => {
    const items = row.items.map((item) => ({
      line_id: item.id,
      product_id: item.productId,
      name: item.productNameSnapshot,
      quantity: item.quantity,
      total: centsToMoney(item.lineTotalCents),
      unit_cost:
        item.supplierUnitCents != null
          ? centsToMoney(item.supplierUnitCents)
          : item.product.costCents != null
            ? centsToMoney(item.product.costCents)
            : null,
    }));
    const profit = orderProfitFromParts({
      totalCents: row.totalCents,
      gstCents: row.gstCents,
      platformFeeCents: row.platformFeeCents,
      processorFeeCents: row.processorFeeCents,
      items: row.items.map((item) => ({
        quantity: item.quantity,
        unitCostCents: item.supplierUnitCents ?? item.product.costCents,
      })),
    });
    return {
      order_id: row.id,
      order_number: row.orderNumber,
      total: centsToMoney(row.totalCents),
      currency: row.currency,
      status: row.paymentStatus.toLowerCase(),
      channel: channelName(row).toLowerCase(),
      payment_method: paymentMethodName(row.paymentMethod, row.localTransferMethodId).toLowerCase(),
      occurred_at: row.createdAt.toISOString(),
      customer_name: row.customerName?.trim() || null,
      tax: centsToMoney(profit.gstCents),
      fees: centsToMoney(profit.feesCents),
      cogs: centsToMoney(profit.cogsCents),
      profit: centsToMoney(profit.grossProfitCents),
      cost_incomplete: profit.costIncomplete,
      items,
    };
  });
}

/** Push Vendl orders to Stitchstack (full history, or incremental when `since` is set). */
export async function pushOrdersToStitchstack(
  ownerId: string,
  options?: { since?: Date | null },
): Promise<{ upserted: number; batches: number }> {
  const apiKey = partnerApiKey();
  if (!apiKey) throw new Error("STITCHSTACK_PARTNER_API_KEY is not configured.");

  let cursor: string | null = null;
  let upserted = 0;
  let batches = 0;
  const since = options?.since ?? null;

  for (;;) {
    const orders = await loadOrderBatch(ownerId, cursor, since);
    if (orders.length === 0) break;

    const response = await fetch(`${STITCHSTACK_APP_URL}/api/partners/vendl/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ external_account_id: ownerId, orders }),
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Stitchstack orders sync failed (${response.status}): ${text.slice(0, 200)}`);
    }

    const body = (await response.json()) as { upserted?: number };
    upserted += Number(body.upserted ?? orders.length);
    batches += 1;
    cursor = orders[orders.length - 1]?.order_id ?? null;
    if (orders.length < BATCH) break;
  }

  return { upserted, batches };
}

/** Full historical backfill. */
export async function pushAllOrdersToStitchstack(ownerId: string) {
  return pushOrdersToStitchstack(ownerId, { since: null });
}
