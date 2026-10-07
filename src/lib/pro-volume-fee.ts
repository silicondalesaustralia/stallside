import { PaymentMethod } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { COUNTED_STATUSES } from "@/lib/order-metrics";
import { isV2026Owner } from "@/lib/fee-v2026";
import { isComplimentaryFeeWaiver, shouldChargeVendlFee } from "@/lib/stallside-fee";

type VolumeOwner = Parameters<typeof shouldChargeVendlFee>[0];

function monthUtcStart(now = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

/** Month-to-date (UTC) Stripe card sales for an owner, in order currency cents. */
export async function loadMonthStripeVolumeCents(ownerId: string): Promise<number> {
  const agg = await prisma.order.aggregate({
    where: {
      ownerId,
      paymentMethod: PaymentMethod.CARD,
      paymentStatus: { in: COUNTED_STATUSES },
      createdAt: { gte: monthUtcStart() },
    },
    _sum: { totalCents: true },
  });
  return agg._sum.totalCents ?? 0;
}

/**
 * Volume only matters for V2026 paid Pro on Stripe; skip the query otherwise.
 * Returns undefined when the overage fee cannot apply.
 */
export async function proVolumeForFees(
  ownerId: string,
  owner: VolumeOwner,
): Promise<number | undefined> {
  if (!isV2026Owner(owner)) return undefined;
  if (shouldChargeVendlFee(owner) || isComplimentaryFeeWaiver(owner)) return undefined;
  try {
    return await loadMonthStripeVolumeCents(ownerId);
  } catch (error) {
    console.error("Pro Stripe volume lookup failed", ownerId, error);
    return undefined;
  }
}
