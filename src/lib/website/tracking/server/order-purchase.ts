import { prisma } from "@/lib/prisma";
import { PaymentStatus, type Prisma } from "@/generated/prisma/client";
import type { StorefrontEvent, TrackItem } from "../events";

const PAID_STATUSES: PaymentStatus[] = [PaymentStatus.PAID, PaymentStatus.DEPOSIT_PAID, PaymentStatus.BALANCE_DUE];

const orderSelect = {
  id: true,
  ownerId: true,
  orderNumber: true,
  totalCents: true,
  currency: true,
  paymentStatus: true,
  receiptEmail: true,
  customerName: true,
  customerPhone: true,
  trackingAttribution: true,
  createdAt: true,
  items: { select: { productId: true, productNameSnapshot: true, quantity: true, unitPriceCents: true } },
} satisfies Prisma.OrderSelect;

export type PurchaseOrder = Prisma.OrderGetPayload<{ select: typeof orderSelect }>;

export function purchaseItems(order: PurchaseOrder): TrackItem[] {
  return order.items.map((i) => ({ id: i.productId, name: i.productNameSnapshot, priceCents: i.unitPriceCents, quantity: i.quantity }));
}

export async function loadPaidPurchaseOrder(where: Prisma.OrderWhereInput): Promise<PurchaseOrder | null> {
  const order = await prisma.order.findFirst({ where, select: orderSelect });
  if (!order || !PAID_STATUSES.includes(order.paymentStatus)) return null;
  return order;
}

/** The browser purchase event for the checkout success page (card / PayPal return). */
export async function purchaseEventForSuccessPage(params: {
  session_id?: string;
  order_id?: string;
}): Promise<StorefrontEvent | null> {
  const where: Prisma.OrderWhereInput | null = params.session_id
    ? { stripeCheckoutSessionId: params.session_id }
    : params.order_id
      ? { id: params.order_id }
      : null;
  if (!where) return null;
  try {
    const order = await loadPaidPurchaseOrder(where);
    if (!order) return null;
    return {
      name: "purchase",
      orderNumber: order.orderNumber,
      items: purchaseItems(order),
      valueCents: order.totalCents,
      currency: order.currency,
    };
  } catch (error) {
    console.error("Purchase event lookup failed", error);
    return null;
  }
}
