import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@/generated/prisma/client";
import { COUNTED_STATUSES } from "@/lib/order-metrics";
import { restockOrderVariants } from "@/lib/product-variants/sync-product-total";

const RESTORE_STATUSES = COUNTED_STATUSES as PaymentStatus[];

/** Refresh every web view that shows orders, whichever client made the change. */
export function revalidateOrderViews() {
  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard");
}

export async function deleteOwnerOrder(
  ownerId: string,
  orderId: string,
): Promise<{ ok: true } | { error: string }> {
  const id = orderId.trim();
  if (!id) return { error: "Order not found." };

  const order = await prisma.order.findFirst({
    where: { id, ownerId },
    include: { items: true },
  });
  if (!order) return { error: "Order not found." };

  const shouldRestore = RESTORE_STATUSES.includes(order.paymentStatus);

  await prisma.$transaction(async (tx) => {
    if (shouldRestore) {
      for (const item of order.items) {
        await tx.product.updateMany({
          where: { id: item.productId },
          data: { stockQuantity: { increment: item.quantity } },
        });
      }
      await restockOrderVariants(tx, order.items);
    }

    await tx.inventoryAdjustment.deleteMany({ where: { orderId: order.id } });
    await tx.orderItem.deleteMany({ where: { orderId: order.id } });
    await tx.order.delete({ where: { id: order.id } });
  });

  revalidateOrderViews();
  return { ok: true };
}

const listSelect = {
  id: true,
  orderNumber: true,
  totalCents: true,
  currency: true,
  createdAt: true,
  paymentMethod: true,
  paymentStatus: true,
  customerName: true,
  isPreOrder: true,
  handoverMode: true,
  collectionStatus: true,
  shippedAt: true,
  deliveredAt: true,
  items: { select: { quantity: true, productNameSnapshot: true } },
} as const;

/** Newest-first page of a stand's orders; pass the last id back as `cursor` for the next page. */
export async function listStandOrders(opts: {
  ownerId: string;
  standId: string;
  limit: number;
  cursor?: string;
}) {
  const rows = await prisma.order.findMany({
    where: { ownerId: opts.ownerId, standId: opts.standId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: opts.limit + 1,
    ...(opts.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
    select: listSelect,
  });
  const hasMore = rows.length > opts.limit;
  const orders = hasMore ? rows.slice(0, opts.limit) : rows;
  return { orders, nextCursor: hasMore ? (orders.at(-1)?.id ?? null) : null };
}

export type StandOrderRow = Awaited<ReturnType<typeof listStandOrders>>["orders"][number];
