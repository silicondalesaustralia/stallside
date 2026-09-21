import { prisma } from "@/lib/prisma";
import { demoStandSlugs } from "@/lib/demo";
import { COUNTED_STATUSES } from "@/lib/order-metrics";
import {
  audRatesFromMarket,
  billingCentsToAud,
  type AudRates,
} from "@/lib/fx-to-aud";
import { buildSalesSeries, type SeriesPoint } from "@/lib/sales-series";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { listPaidSubscriptionInvoicesInRange } from "@/lib/stripe-ltv";

export type LtvWindow = {
  points: SeriesPoint[];
  totalAudCents: number;
  feeAudCents: number;
  subscriptionAudCents: number;
  subscriptionsLoaded: boolean;
};

/** Fees plus subscription invoices in a window, in AUD cents. Excludes demo stands. */
export async function getLtvWindow(
  start: Date,
  end: Date,
  rates?: AudRates,
): Promise<LtvWindow> {
  const fx = rates ?? (await audRatesFromMarket());
  const demoSlugs = [...demoStandSlugs()];
  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: start, lte: end },
      paymentStatus: { in: COUNTED_STATUSES },
      platformFeeCents: { gt: 0 },
      ...(demoSlugs.length
        ? { stand: { slug: { notIn: demoSlugs } } }
        : {}),
    },
    select: { createdAt: true, platformFeeCents: true, currency: true },
  });

  const payments: { totalCents: number; createdAt: Date }[] = [];
  let feeAudCents = 0;
  for (const order of orders) {
    const aud = billingCentsToAud(order.platformFeeCents, order.currency, fx);
    feeAudCents += aud;
    payments.push({ totalCents: aud, createdAt: order.createdAt });
  }

  let subscriptionAudCents = 0;
  let subscriptionsLoaded = !isStripeConfigured();
  if (isStripeConfigured()) {
    try {
      const invoices = await listPaidSubscriptionInvoicesInRange(
        getStripe(),
        start,
        end,
      );
      subscriptionsLoaded = true;
      for (const invoice of invoices) {
        const aud = billingCentsToAud(invoice.amountCents, invoice.currency, fx);
        subscriptionAudCents += aud;
        payments.push({ totalCents: aud, createdAt: invoice.paidAt });
      }
    } catch (error) {
      console.error("Admin LTV window: subscription invoices", error);
    }
  }

  return {
    points: buildSalesSeries(payments, start, end),
    totalAudCents: feeAudCents + subscriptionAudCents,
    feeAudCents,
    subscriptionAudCents,
    subscriptionsLoaded,
  };
}
