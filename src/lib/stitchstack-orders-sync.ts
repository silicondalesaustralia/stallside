import { PaymentStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { channelName, paymentMethodName } from "@/lib/order-export/labels";
import { STITCHSTACK_APP_URL } from "@/lib/stitchstack";

const BATCH = 500;

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
};

function partnerApiKey(): string | null {
  return process.env.STITCHSTACK_PARTNER_API_KEY?.trim() || process.env.VENDL_PARTNER_API_KEY?.trim() || null;
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
      currency: true,
      paymentStatus: true,
      paymentMethod: true,
      localTransferMethodId: true,
      createdAt: true,
      customerName: true,
      isPreOrder: true,
      shopperSubscriptionId: true,
    },
  });

  return rows.map((row) => ({
    order_id: row.id,
    order_number: row.orderNumber,
    total: Math.round(row.totalCents) / 100,
    currency: row.currency,
    status: row.paymentStatus.toLowerCase(),
    channel: channelName(row).toLowerCase(),
    payment_method: paymentMethodName(row.paymentMethod, row.localTransferMethodId).toLowerCase(),
    occurred_at: row.createdAt.toISOString(),
    customer_name: row.customerName?.trim() || null,
  }));
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
