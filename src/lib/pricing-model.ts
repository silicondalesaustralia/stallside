import type Stripe from "stripe";
import { PricingModel } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

export type PricingMoveReason = "pro_subscribed" | "square_connected";

export type PricingMoveResult =
  | { moved: true; lifetimeEnded: boolean }
  | { moved: false; reason: "already_v2026" | "not_found" | "lifetime_unconfirmed" };

export const WEEKLY_PAYOUT_SCHEDULE: Stripe.AccountUpdateParams.Settings.Payouts.Schedule =
  { interval: "weekly", weekly_anchor: "monday" };

async function setWeeklyPayouts(stripeAccountId: string): Promise<void> {
  if (!isStripeConfigured()) return;
  try {
    await getStripe().accounts.update(stripeAccountId, {
      settings: { payouts: { schedule: WEEKLY_PAYOUT_SCHEDULE } },
    });
  } catch (error) {
    console.error("Weekly payout schedule update failed", stripeAccountId, error);
  }
}

/**
 * One-way move from LEGACY to V2026. Lifetime owners are only moved when the
 * caller passes endLifetime (seller confirmed losing Lifetime).
 */
export async function moveToV2026(
  ownerId: string,
  reason: PricingMoveReason,
  opts: { endLifetime?: boolean } = {},
): Promise<PricingMoveResult> {
  const result = await prisma.$transaction(async (tx) => {
    const owner = await tx.owner.findUnique({
      where: { id: ownerId },
      select: { pricingModel: true, lifetimeAccess: true, stripeAccountId: true },
    });
    if (!owner) return { moved: false as const, reason: "not_found" as const };
    if (owner.pricingModel === PricingModel.V2026) {
      return { moved: false as const, reason: "already_v2026" as const };
    }
    if (owner.lifetimeAccess && !opts.endLifetime) {
      return { moved: false as const, reason: "lifetime_unconfirmed" as const };
    }
    const now = new Date();
    await tx.owner.update({
      where: { id: ownerId },
      data: {
        pricingModel: PricingModel.V2026,
        pricingModelChangedAt: now,
        pricingModelReason: reason,
        ...(owner.lifetimeAccess
          ? { lifetimeAccess: false, lifetimeEndedAt: now }
          : {}),
      },
    });
    return {
      moved: true as const,
      lifetimeEnded: owner.lifetimeAccess,
      stripeAccountId: owner.stripeAccountId,
    };
  });

  if (!result.moved) {
    if (result.reason === "lifetime_unconfirmed") {
      console.warn("moveToV2026 skipped: lifetime owner did not confirm", ownerId, reason);
    }
    return result;
  }
  if (result.stripeAccountId) await setWeeklyPayouts(result.stripeAccountId);
  return { moved: true, lifetimeEnded: result.lifetimeEnded };
}
