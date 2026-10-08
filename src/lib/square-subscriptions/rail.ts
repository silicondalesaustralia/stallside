import { OnlinePaymentProvider } from "@/generated/prisma/client";
import {
  squareConnectionMatchesBilling,
  squareCurrencyForBilling,
} from "@/lib/commerce/payment-rail";
import { isSquareSubscriptionsEnabled } from "@/lib/square/config";
import { getSquareConnection } from "@/lib/square/connection";
import { connectionSquareRegion, type SquareRegion } from "@/lib/square/region";
import { hasSquareSubscriptionScopes } from "@/lib/square/scopes";
import type { MembershipPlan } from "@/lib/subscription-offer";

export type SquareSubscriptionRail = {
  connectionId: string;
  locationId: string;
  region: SquareRegion;
};

/** Square bills new signups when the seller picked Square checkout and turned on Square subscriptions. */
export async function squareSubscriptionRail(input: {
  stand: { acceptSquare: boolean };
  owner: { id: string; billingCurrency: string | null; onlinePaymentProvider: OnlinePaymentProvider };
  offerCurrency: string;
}): Promise<SquareSubscriptionRail | null> {
  if (!isSquareSubscriptionsEnabled()) return null;
  if (input.owner.onlinePaymentProvider !== OnlinePaymentProvider.SQUARE) return null;
  const squareCurrency = squareCurrencyForBilling(input.owner.billingCurrency);
  if (!squareCurrency) return null;
  if (input.offerCurrency.trim().toUpperCase() !== squareCurrency) return null;
  if (!input.stand.acceptSquare) return null;

  const conn = await getSquareConnection(input.owner.id);
  if (
    !conn ||
    conn.status !== "ACTIVE" ||
    !conn.paymentsEnabled ||
    !conn.subscriptionsEnabled ||
    !conn.primaryLocationId ||
    !hasSquareSubscriptionScopes(conn.scopes) ||
    !squareConnectionMatchesBilling(conn, input.owner.billingCurrency)
  ) {
    return null;
  }
  return {
    connectionId: conn.id,
    locationId: conn.primaryLocationId,
    region: connectionSquareRegion(conn),
  };
}

/** Renewals keep billing existing subscribers even if the seller later stops new Square signups. */
export async function squareRenewalRail(ownerId: string): Promise<SquareSubscriptionRail | null> {
  const conn = await getSquareConnection(ownerId);
  if (
    !conn ||
    conn.status !== "ACTIVE" ||
    !conn.paymentsEnabled ||
    !conn.primaryLocationId ||
    !hasSquareSubscriptionScopes(conn.scopes)
  ) {
    return null;
  }
  return {
    connectionId: conn.id,
    locationId: conn.primaryLocationId,
    region: connectionSquareRegion(conn),
  };
}

type SquareOfferPrices = {
  kind: string;
  priceCents: number;
  weeklyPriceCents: number | null;
  monthlyPriceCents: number | null;
  upfrontPriceCents: number | null;
};

const positive = (cents: number | null): cents is number => cents != null && cents > 0;

/** Plans a membership can be bought on through Square (no Stripe prices needed). */
export function squareMembershipPlans(
  offer: SquareOfferPrices,
): { plan: MembershipPlan; priceCents: number }[] {
  const plans: { plan: MembershipPlan; priceCents: number }[] = [];
  if (positive(offer.weeklyPriceCents)) plans.push({ plan: "WEEKLY", priceCents: offer.weeklyPriceCents });
  if (positive(offer.monthlyPriceCents)) plans.push({ plan: "MONTHLY", priceCents: offer.monthlyPriceCents });
  if (positive(offer.upfrontPriceCents)) plans.push({ plan: "UPFRONT", priceCents: offer.upfrontPriceCents });
  return plans;
}

/** Price per period for a Square signup, or null when the plan isn't offered. */
export function squareSignupPriceCents(
  offer: SquareOfferPrices,
  plan: MembershipPlan | null,
): number | null {
  if (offer.kind !== "MEMBERSHIP") return positive(offer.priceCents) ? offer.priceCents : null;
  return squareMembershipPlans(offer).find((p) => p.plan === plan)?.priceCents ?? null;
}

export function squareOfferReady(offer: SquareOfferPrices): boolean {
  if (offer.kind !== "MEMBERSHIP") return positive(offer.priceCents);
  return squareMembershipPlans(offer).length > 0;
}
