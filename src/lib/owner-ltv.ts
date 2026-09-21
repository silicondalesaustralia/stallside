import { prisma } from "@/lib/prisma";
import { COUNTED_STATUSES } from "@/lib/order-metrics";
import {
  billingCentsToAud,
  formatBillingWithAud,
  type AudRates,
} from "@/lib/fx-to-aud";
import { formatMoney } from "@/lib/money";

export type FeeBucket = { currency: string; cents: number };

const countedFeeWhere = {
  paymentStatus: { in: COUNTED_STATUSES },
  platformFeeCents: { gt: 0 },
} as const;

/** Platform fees on counted orders, grouped by currency. */
export async function platformFeesByOwner(
  ownerIds: string[],
): Promise<Map<string, FeeBucket[]>> {
  const map = new Map<string, FeeBucket[]>();
  if (ownerIds.length === 0) return map;

  const rows = await prisma.order.groupBy({
    by: ["ownerId", "currency"],
    where: { ownerId: { in: ownerIds }, ...countedFeeWhere },
    _sum: { platformFeeCents: true },
  });

  for (const row of rows) {
    const cents = row._sum.platformFeeCents ?? 0;
    if (cents <= 0) continue;
    const list = map.get(row.ownerId) ?? [];
    list.push({ currency: row.currency, cents });
    map.set(row.ownerId, list);
  }
  return map;
}

/** All counted platform fees, for the platform-wide LTV total. */
export async function platformFeesByCurrency(): Promise<FeeBucket[]> {
  const rows = await prisma.order.groupBy({
    by: ["currency"],
    where: countedFeeWhere,
    _sum: { platformFeeCents: true },
  });
  return rows
    .map((row) => ({
      currency: row.currency,
      cents: row._sum.platformFeeCents ?? 0,
    }))
    .filter((row) => row.cents > 0);
}

export function bucketsToAud(buckets: FeeBucket[], rates: AudRates): number {
  return buckets.reduce(
    (sum, bucket) =>
      sum + billingCentsToAud(bucket.cents, bucket.currency, rates),
    0,
  );
}

/** Subscription invoices plus transaction fees, in AUD cents. */
export function ownerLtvAudCents(input: {
  subscriptionCents: number;
  billingCurrency: string;
  fees: FeeBucket[];
  rates: AudRates;
}): number {
  return (
    billingCentsToAud(
      input.subscriptionCents,
      input.billingCurrency,
      input.rates,
    ) + bucketsToAud(input.fees, input.rates)
  );
}

/** One currency stays in that currency; mixed currencies show the AUD total. */
export function formatOwnerLtv(input: {
  subscriptionCents: number;
  billingCurrency: string;
  fees: FeeBucket[];
  rates: AudRates;
}): string {
  const billing = (input.billingCurrency || "AUD").toUpperCase();
  const currencies = new Set<string>();
  if (input.subscriptionCents > 0) currencies.add(billing);
  for (const fee of input.fees) {
    if (fee.cents > 0) currencies.add(fee.currency.toUpperCase());
  }
  if (currencies.size === 0) return formatMoney(0, "AUD");
  if (currencies.size > 1) {
    return formatMoney(ownerLtvAudCents(input), "AUD");
  }

  const currency = [...currencies][0] ?? "AUD";
  const native =
    (currency === billing ? input.subscriptionCents : 0) +
    input.fees
      .filter((fee) => fee.currency.toUpperCase() === currency)
      .reduce((sum, fee) => sum + fee.cents, 0);
  return formatBillingWithAud(native, currency, input.rates);
}

export function formatFeeBuckets(buckets: FeeBucket[], rates: AudRates): string {
  const positive = buckets.filter((bucket) => bucket.cents > 0);
  if (positive.length === 0) return formatMoney(0, "AUD");
  return positive
    .map((bucket) => formatBillingWithAud(bucket.cents, bucket.currency, rates))
    .join(" + ");
}
