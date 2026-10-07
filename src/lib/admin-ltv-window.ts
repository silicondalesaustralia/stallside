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
import {
  applicationFeesToAud,
  listApplicationFeeEvents,
} from "@/lib/stripe-application-fees";
import { listPaidSubscriptionInvoicesInRange } from "@/lib/stripe-ltv";

export type LtvWindow = {
  points: SeriesPoint[];
  totalAudCents: number;
  feeAudCents: number;
  subscriptionAudCents: number;
  subscriptionsLoaded: boolean;
  feesFromStripe: boolean;
};

/** Fees plus subscription invoices in a window, in AUD cents. */
export async function getLtvWindow(
  start: Date,
  end: Date,
  rates?: AudRates,
): Promise<LtvWindow> {
  const fx = rates ?? (await audRatesFromMarket());
  const payments: { totalCents: number; createdAt: Date }[] = [];

  const fees = await loadFeeEvents(start, end, fx);
  for (const event of fees.events) {
    payments.push({ totalCents: event.audCents, createdAt: event.at });
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
    totalAudCents: fees.audCents + subscriptionAudCents,
    feeAudCents: fees.audCents,
    subscriptionAudCents,
    subscriptionsLoaded,
    feesFromStripe: fees.fromStripe,
  };
}

async function loadFeeEvents(
  start: Date,
  end: Date,
  fx: AudRates,
): Promise<{
  audCents: number;
  fromStripe: boolean;
  events: { audCents: number; at: Date }[];
}> {
  if (isStripeConfigured()) {
    try {
      const fees = await listApplicationFeeEvents(getStripe(), { start, end });
      return {
        audCents: applicationFeesToAud(fees, fx),
        fromStripe: true,
        events: fees.map((fee) => ({
          audCents: billingCentsToAud(fee.amountCents, fee.currency, fx),
          at: fee.createdAt,
        })),
      };
    } catch (error) {
      console.error("Admin LTV window: application fees", error);
    }
  }

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
  const events = orders.map((order) => ({
    audCents: billingCentsToAud(order.platformFeeCents, order.currency, fx),
    at: order.createdAt,
  }));
  return {
    audCents: events.reduce((sum, event) => sum + event.audCents, 0),
    fromStripe: false,
    events,
  };
}
