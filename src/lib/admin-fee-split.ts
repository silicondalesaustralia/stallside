import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { demoStandSlugs } from "@/lib/demo";
import { COUNTED_STATUSES } from "@/lib/order-metrics";
import { billingCentsToAud, type AudRates } from "@/lib/fx-to-aud";
import { squareOrderWhere, stripeOrderWhere } from "@/lib/payment-rail";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { listApplicationFeeEvents } from "@/lib/stripe-application-fees";

export type FeeEvent = { audCents: number; at: Date };

export type FeeRail = {
  audCents: number;
  events: FeeEvent[];
};

export type FeeSplit = {
  stripe: FeeRail & { fromStripe: boolean };
  square: FeeRail;
  totalAudCents: number;
};

type Range = { start?: Date; end?: Date };

function toRail(events: FeeEvent[]): FeeRail {
  return {
    audCents: events.reduce((sum, event) => sum + event.audCents, 0),
    events,
  };
}

async function orderFeeEvents(
  railWhere: Prisma.OrderWhereInput,
  range: Range,
  fx: AudRates,
): Promise<FeeEvent[]> {
  const demoSlugs = [...demoStandSlugs()];
  const orders = await prisma.order.findMany({
    where: {
      AND: [
        railWhere,
        {
          paymentStatus: { in: COUNTED_STATUSES },
          platformFeeCents: { gt: 0 },
          ...(range.start || range.end
            ? { createdAt: { gte: range.start, lte: range.end } }
            : {}),
          ...(demoSlugs.length
            ? { stand: { slug: { notIn: demoSlugs } } }
            : {}),
        },
      ],
    },
    select: { createdAt: true, platformFeeCents: true, currency: true },
  });
  return orders.map((order) => ({
    audCents: billingCentsToAud(order.platformFeeCents, order.currency, fx),
    at: order.createdAt,
  }));
}

async function stripeFeeRail(
  range: Range,
  fx: AudRates,
): Promise<FeeRail & { fromStripe: boolean }> {
  if (isStripeConfigured()) {
    try {
      const fees = await listApplicationFeeEvents(getStripe(), range);
      const events = fees.map((fee) => ({
        audCents: billingCentsToAud(fee.amountCents, fee.currency, fx),
        at: fee.createdAt,
      }));
      return { ...toRail(events), fromStripe: true };
    } catch (error) {
      console.error("Admin fee split: Stripe application fees", error);
    }
  }
  const events = await orderFeeEvents(stripeOrderWhere, range, fx);
  return { ...toRail(events), fromStripe: false };
}

/** Vendl fees split by rail: Stripe application fees + Square app fees on orders. */
export async function getFeeSplit(range: Range, fx: AudRates): Promise<FeeSplit> {
  const [stripe, squareEvents] = await Promise.all([
    stripeFeeRail(range, fx),
    orderFeeEvents(squareOrderWhere, range, fx),
  ]);
  const square = toRail(squareEvents);
  return { stripe, square, totalAudCents: stripe.audCents + square.audCents };
}
