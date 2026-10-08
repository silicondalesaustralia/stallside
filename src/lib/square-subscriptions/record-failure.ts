import { ShopperSubStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  sendBillingCancelledEmails,
  sendPaymentFailedEmail,
  type BillingEmailSub,
} from "@/lib/square-subscriptions/billing-emails";
import { afterFailedCharge } from "@/lib/square-subscriptions/schedule";

/** A declined renewal: retry after 1, 3 and 5 days, then cancel and tell both sides. */
export async function recordSquareSubscriptionFailure(input: {
  sub: BillingEmailSub & { id: string; ownerId: string; billingFailures: number };
  periodStart: Date;
  amountCents: number;
  currency: string;
  reason: string;
  now: Date;
}): Promise<"retry" | "cancelled"> {
  const { sub, now } = input;
  const failures = sub.billingFailures + 1;
  const outcome = afterFailedCharge(failures, now);

  await prisma.$transaction([
    prisma.shopperSubscriptionCharge.create({
      data: {
        shopperSubscriptionId: sub.id,
        ownerId: sub.ownerId,
        periodStart: input.periodStart,
        amountCents: input.amountCents,
        currency: input.currency,
        status: "FAILED",
        failureReason: input.reason.slice(0, 500),
      },
    }),
    prisma.shopperSubscription.update({
      where: { id: sub.id },
      data:
        outcome.action === "cancel"
          ? {
              status: ShopperSubStatus.CANCELLED,
              billingFailures: failures,
              nextBillingAt: null,
              billingRetryAt: null,
              billingLockedUntil: null,
              nextCollectionAt: null,
            }
          : {
              status: ShopperSubStatus.PAST_DUE,
              billingFailures: failures,
              billingRetryAt: outcome.retryAt,
              billingLockedUntil: null,
            },
    }),
  ]);

  if (outcome.action === "cancel") {
    await sendBillingCancelledEmails(sub);
    return "cancelled";
  }
  if (failures === 1) await sendPaymentFailedEmail(sub, outcome.retryAt);
  return "retry";
}
