import {
  audRatesFromMarket,
  billingCentsToAud,
  type AudRates,
} from "@/lib/fx-to-aud";
import { getFeeSplit } from "@/lib/admin-fee-split";
import { buildSalesSeries, type SeriesPoint } from "@/lib/sales-series";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { listPaidSubscriptionInvoicesInRange } from "@/lib/stripe-ltv";

export type LtvWindow = {
  points: SeriesPoint[];
  totalAudCents: number;
  feeAudCents: number;
  stripeFeeAudCents: number;
  squareFeeAudCents: number;
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

  const fees = await getFeeSplit({ start, end }, fx);
  for (const event of [...fees.stripe.events, ...fees.square.events]) {
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
    totalAudCents: fees.totalAudCents + subscriptionAudCents,
    feeAudCents: fees.totalAudCents,
    stripeFeeAudCents: fees.stripe.audCents,
    squareFeeAudCents: fees.square.audCents,
    subscriptionAudCents,
    subscriptionsLoaded,
    feesFromStripe: fees.stripe.fromStripe,
  };
}
