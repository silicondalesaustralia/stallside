import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { cardPlanCents, isBillingCurrency } from "@/lib/saas-pricing";
import { COUNTED_STATUSES } from "@/lib/order-metrics";
import {
  shouldChargeVendlFee,
} from "@/lib/stallside-fee";
import { isV2026Owner, proOverageFeeCents } from "@/lib/fee-v2026";
import { loadMonthStripeVolumeCents } from "@/lib/pro-volume-fee";
import type { Role, SubscriptionStatus } from "@/generated/prisma/client";

type FeeOwner = {
  pricingModel?: string | null;
  subscriptionPlan?: string | null;
  lifetimeAccess?: boolean | null;
  subscriptionStatus?: SubscriptionStatus | string | null;
  trialEndsAt?: Date | null;
  currentPeriodEndsAt?: Date | null;
  cancelAtPeriodEnd?: boolean;
  passFeeToCustomer?: boolean | null;
  contactEmail?: string | null;
  billingCurrency: string;
};

export type VendlFeeEconomics = {
  show: boolean;
  feesThisMonthCents: number;
  currency: string;
  feesFormatted: string;
  proPriceCents: number;
  proPriceFormatted: string;
  annualisedFeesCents: number;
  annualisedFormatted: string;
  proMaySave: boolean;
  savingVsProCents: number;
  savingFormatted: string;
};

function monthUtcStart(now = new Date()): Date {
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0),
  );
}

/** V2026 Pro overage a seller would pay per year at this month's Stripe pace. */
async function projectedProOverageYearCents(
  ownerId: string,
  dayOfMonth: number,
): Promise<number> {
  const mtd = await loadMonthStripeVolumeCents(ownerId);
  const monthPace = Math.round((mtd / dayOfMonth) * (365 / 12));
  return proOverageFeeCents(monthPace, 0) * 12;
}

/** Sum recorded Vendl fees this calendar month (UTC). Does not recalculate fees. */
export async function loadVendlFeeEconomics(input: {
  ownerId: string;
  owner: FeeOwner;
  access?: { email?: string | null; role?: Role | string | null };
}): Promise<VendlFeeEconomics | null> {
  if (!shouldChargeVendlFee(input.owner, input.access)) {
    return null;
  }

  const currency = isBillingCurrency(input.owner.billingCurrency)
    ? input.owner.billingCurrency
    : "AUD";
  const monthStart = monthUtcStart();

  const agg = await prisma.order.aggregate({
    where: {
      ownerId: input.ownerId,
      createdAt: { gte: monthStart },
      paymentStatus: { in: COUNTED_STATUSES },
      platformFeeCents: { gt: 0 },
    },
    _sum: { platformFeeCents: true },
  });

  const feesThisMonthCents = agg._sum.platformFeeCents ?? 0;
  if (feesThisMonthCents <= 0) return null;

  const proPriceCents = cardPlanCents(currency);
  const dayOfMonth = Math.max(
    1,
    new Date().getUTCDate(),
  );
  const annualisedFeesCents = Math.round(
    (feesThisMonthCents / dayOfMonth) * 365,
  );
  const proOverageYearCents = isV2026Owner(input.owner)
    ? await projectedProOverageYearCents(input.ownerId, dayOfMonth)
    : 0;
  const savingVsProCents =
    annualisedFeesCents - proPriceCents * 12 - proOverageYearCents;
  const proMaySave = savingVsProCents > 0;

  return {
    show: true,
    feesThisMonthCents,
    currency,
    feesFormatted: formatMoney(feesThisMonthCents, currency),
    proPriceCents,
    proPriceFormatted: formatMoney(proPriceCents, currency),
    annualisedFeesCents,
    annualisedFormatted: formatMoney(annualisedFeesCents, currency),
    proMaySave,
    savingVsProCents,
    savingFormatted: formatMoney(Math.abs(savingVsProCents), currency),
  };
}
