import { OnlinePaymentProvider, ShopperSubStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { renewSquareSubscription, type RenewalOutcome } from "@/lib/square-subscriptions/renew";

const BATCH = 50;

/** Charge every Square subscription whose period (or retry) is due. */
export async function runSquareSubscriptionBilling(
  now = new Date(),
): Promise<Record<RenewalOutcome | "errors", number>> {
  const due = await prisma.shopperSubscription.findMany({
    where: {
      paymentProvider: OnlinePaymentProvider.SQUARE,
      status: { in: [ShopperSubStatus.ACTIVE, ShopperSubStatus.PAST_DUE] },
      nextBillingAt: { lte: now },
      AND: [
        { OR: [{ billingRetryAt: null }, { billingRetryAt: { lte: now } }] },
        { OR: [{ billingLockedUntil: null }, { billingLockedUntil: { lt: now } }] },
      ],
    },
    orderBy: { nextBillingAt: "asc" },
    select: { id: true },
    take: BATCH,
  });

  const totals: Record<RenewalOutcome | "errors", number> = {
    paid: 0,
    retry: 0,
    cancelled: 0,
    skipped: 0,
    deferred: 0,
    idle: 0,
    errors: 0,
  };
  for (const { id } of due) {
    try {
      totals[await renewSquareSubscription(id, now)] += 1;
    } catch (error) {
      totals.errors += 1;
      console.error("Square subscription renewal crashed", id, error);
    }
  }
  return totals;
}
