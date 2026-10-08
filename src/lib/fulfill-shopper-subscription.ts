import type Stripe from "stripe";
import { ShopperSubStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { createSubscriptionCycleOrder } from "@/lib/subscription-cycle-order";
import {
  paymentIntentIdFromInvoice,
  subscriptionIdFromInvoice,
} from "@/lib/stripe-invoice-ids";

/** Create a stand Order from a paid Connect subscription invoice (idempotent). */
export async function fulfillShopperSubscriptionInvoice(
  invoice: Stripe.Invoice,
) {
  if (invoice.amount_paid <= 0) return;
  const invoiceId = invoice.id;
  if (!invoiceId) return;

  const existing = await prisma.order.findUnique({
    where: { stripeInvoiceId: invoiceId },
    select: { id: true },
  });
  if (existing) return;

  const subscriptionId = subscriptionIdFromInvoice(invoice);
  if (!subscriptionId) return;

  const metaSubId =
    invoice.metadata?.shopperSubscriptionId ??
    invoice.parent?.subscription_details?.metadata?.shopperSubscriptionId;

  const sub = await prisma.shopperSubscription.findFirst({
    where: metaSubId
      ? {
          OR: [
            { stripeSubscriptionId: subscriptionId },
            { id: String(metaSubId) },
          ],
        }
      : { stripeSubscriptionId: subscriptionId },
    include: {
      offer: {
        include: {
          items: {
            orderBy: { sortOrder: "asc" },
            include: { product: true },
          },
        },
      },
    },
  });
  if (!sub) return;

  if (!sub.stripeSubscriptionId) {
    await prisma.shopperSubscription.update({
      where: { id: sub.id },
      data: {
        stripeSubscriptionId: subscriptionId,
        status: ShopperSubStatus.ACTIVE,
      },
    });
  }

  // Membership collections are created by cron, not invoices.
  if (sub.offer.kind === "MEMBERSHIP") {
    const periodEnd =
      invoice.lines?.data?.[0]?.period?.end != null
        ? new Date(invoice.lines.data[0].period.end * 1000)
        : null;
    await prisma.shopperSubscription.update({
      where: { id: sub.id },
      data: {
        status: ShopperSubStatus.ACTIVE,
        paidThroughAt: periodEnd ?? undefined,
      },
    });
    return;
  }

  if (sub.skipNextCycle) {
    await prisma.shopperSubscription.update({
      where: { id: sub.id },
      data: { skipNextCycle: false },
    });
    return;
  }

  if (
    sub.status === ShopperSubStatus.CANCELLED ||
    sub.status === ShopperSubStatus.PAUSED
  ) {
    return;
  }

  await createSubscriptionCycleOrder(sub.id, {
    rail: "stripe",
    stripeInvoiceId: invoiceId,
    stripePaymentIntentId: paymentIntentIdFromInvoice(invoice),
  });
}
