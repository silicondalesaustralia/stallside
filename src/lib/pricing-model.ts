import type Stripe from "stripe";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

export const WEEKLY_PAYOUT_SCHEDULE: Stripe.AccountUpdateParams.Settings.Payouts.Schedule =
  { interval: "weekly", weekly_anchor: "monday" };

/** Owners with a paid Stripe order before this stay on LEGACY (daily payouts). */
export const LEGACY_CUTOFF = new Date("2026-10-12T13:30:00.000Z");

export async function setWeeklyPayouts(stripeAccountId: string): Promise<void> {
  if (!isStripeConfigured()) throw new Error("Stripe is not configured.");
  await getStripe().accounts.update(stripeAccountId, {
    settings: { payouts: { schedule: WEEKLY_PAYOUT_SCHEDULE } },
  });
}
