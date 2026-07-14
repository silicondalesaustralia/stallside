import { prisma } from "@/lib/prisma";
import {
  InventorySource,
  PaymentMethod,
  PaymentStatus,
  type Prisma,
} from "@/generated/prisma/client";
import { PLATFORM_FEE_BPS } from "@/lib/constants";
import { platformFeeCents } from "@/lib/money";
import { notifySale } from "@/lib/notify";

export type CartItemInput = { productId: string; quantity: number };

type Tx = Prisma.TransactionClient;

export async function loadStandCart(standSlug: string, items: CartItemInput[]) {
  if (!items.length) {
    return { error: "Add at least one item." as const };
  }

  const normalized = items.map((item) => ({
    productId: item.productId,
    quantity: Number(item.quantity),
  }));

  const stand = await prisma.stand.findUnique({
    where: { slug: standSlug },
    include: { owner: true },
  });
  if (!stand || !stand.isActive) {
    return { error: "This stand is not available." as const };
  }

  const productIds = normalized.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, standId: stand.id, isActive: true },
  });
  if (products.length !== productIds.length) {
    return { error: "One or more products are unavailable." as const };
  }

  const byId = new Map(products.map((p) => [p.id, p]));
  for (const item of normalized) {
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      return { error: "Quantities must be whole numbers." as const };
    }
    const product = byId.get(item.productId);
    if (!product || product.stockQuantity < item.quantity) {
      return { error: "Not enough stock for one of your items." as const };
    }
  }

  const lineData = normalized.map((item) => {
    const product = byId.get(item.productId)!;
    return {
      productId: product.id,
      productNameSnapshot: product.name,
      quantity: item.quantity,
      unitPriceCents: product.priceCents,
      lineTotalCents: product.priceCents * item.quantity,
    };
  });
  const totalCents = lineData.reduce((sum, l) => sum + l.lineTotalCents, 0);

  return { stand, byId, items: normalized, lineData, totalCents };
}

export async function decrementStockForOrder(
  tx: Tx,
  input: {
    items: CartItemInput[];
    byId: Map<string, { id: string; stockQuantity: number }>;
    ownerId: string;
    standId: string;
    orderId: string;
    source: typeof InventorySource.ORDER_CASH | typeof InventorySource.ORDER_CARD;
    reason: string;
  },
) {
  for (const item of input.items) {
    const updated = await tx.product.updateMany({
      where: { id: item.productId, stockQuantity: { gte: item.quantity } },
      data: { stockQuantity: { decrement: item.quantity } },
    });
    if (updated.count !== 1) {
      throw new Error("STOCK");
    }
  }

  for (const item of input.items) {
    const product = input.byId.get(item.productId)!;
    await tx.inventoryAdjustment.create({
      data: {
        productId: product.id,
        ownerId: input.ownerId,
        standId: input.standId,
        changeQuantity: -item.quantity,
        previousQuantity: product.stockQuantity,
        newQuantity: product.stockQuantity - item.quantity,
        reason: input.reason,
        source: input.source,
        orderId: input.orderId,
      },
    });
  }
}

export async function fulfillPaidCardOrder(orderId: string, paymentIntentId?: string | null) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return { error: "Order not found." as const };
  if (order.paymentStatus === PaymentStatus.PAID) {
    return { orderNumber: order.orderNumber, alreadyPaid: true as const };
  }
  if (order.paymentMethod !== PaymentMethod.CARD) {
    return { error: "Not a card order." as const };
  }

  const products = await prisma.product.findMany({
    where: { id: { in: order.items.map((i) => i.productId) } },
  });
  const byId = new Map(products.map((p) => [p.id, p]));
  const items = order.items.map((i) => ({
    productId: i.productId,
    quantity: i.quantity,
  }));

  const fee = platformFeeCents(order.totalCents, PLATFORM_FEE_BPS);

  try {
    await prisma.$transaction(
      async (tx) => {
        await decrementStockForOrder(tx, {
          items,
          byId,
          ownerId: order.ownerId,
          standId: order.standId,
          orderId: order.id,
          source: InventorySource.ORDER_CARD,
          reason: "Card sale",
        });
        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: PaymentStatus.PAID,
            platformFeeCents: fee,
            stripePaymentIntentId: paymentIntentId ?? order.stripePaymentIntentId,
          },
        });
      },
      { maxWait: 10_000, timeout: 30_000 },
    );
  } catch (error) {
    if (error instanceof Error && error.message === "STOCK") {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: PaymentStatus.FAILED },
      });
      return { error: "Paid but stock unavailable — contact the stand owner." as const };
    }
    throw error;
  }

  void notifySale(orderId).catch((error) => {
    console.error("Sale notify failed", error);
  });

  return { orderNumber: order.orderNumber, alreadyPaid: false as const };
}
