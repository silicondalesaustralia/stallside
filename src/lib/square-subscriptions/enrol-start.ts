import {
  MembershipBillingPlan,
  OnlinePaymentProvider,
  ShopperSubStatus,
  SubscriptionOfferKind,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { newManageToken } from "@/lib/shopper-subscription-fee";
import { squareApplicationId } from "@/lib/square/config";
import {
  membershipTermEndsAt,
  parseMembershipBillingPlan,
  subscriptionManagePath,
  type MembershipPlan,
} from "@/lib/subscription-offer";
import type { SquareSubscriptionRail } from "@/lib/square-subscriptions/rail";
import { squareSignupPriceCents } from "@/lib/square-subscriptions/rail";

export type SquareSubscriptionSession = {
  manageToken: string;
  managePath: string;
  applicationId: string;
  locationId: string;
  amountCents: number;
  currency: string;
  customerName: string;
  customerEmail: string;
};

type Offer = {
  id: string;
  kind: SubscriptionOfferKind;
  priceCents: number;
  currency: string;
  termWeeks: number | null;
  weeklyPriceCents: number | null;
  monthlyPriceCents: number | null;
  upfrontPriceCents: number | null;
  stand: { id: string; slug: string; ownerId: string };
};

/** Create the pending signup; the card is charged in completeSquareSubscriptionSignup. */
export async function startSquareShopperSubscription(input: {
  offer: Offer;
  rail: SquareSubscriptionRail;
  billingPlan?: string;
  customer: { name: string; email: string; phone: string | null; id: string | null };
  delivery: { line1: string | null; suburb: string | null; postcode: string | null; notes: string | null };
}): Promise<{ square: SquareSubscriptionSession } | { error: string }> {
  const applicationId = squareApplicationId(input.rail.region);
  if (!applicationId) return { error: "Card payments are not configured yet." };

  const { offer } = input;
  const isMembership = offer.kind === SubscriptionOfferKind.MEMBERSHIP;
  let plan: MembershipPlan | null = null;
  if (isMembership) {
    plan = parseMembershipBillingPlan(input.billingPlan) as MembershipPlan | null;
    if (!plan) return { error: "Choose a payment plan." };
  }
  const amountCents = squareSignupPriceCents(offer, plan);
  if (amountCents == null) return { error: "This plan is not available." };

  const termWeeks = offer.termWeeks ?? 26;
  const termEndsAt = isMembership ? membershipTermEndsAt(new Date(), termWeeks) : null;
  const manageToken = newManageToken();

  await prisma.shopperSubscription.create({
    data: {
      offerId: offer.id,
      standId: offer.stand.id,
      ownerId: offer.stand.ownerId,
      status: ShopperSubStatus.INCOMPLETE,
      paymentProvider: OnlinePaymentProvider.SQUARE,
      recurringPriceCents: amountCents,
      billingPlan: plan ? (plan as MembershipBillingPlan) : null,
      termEndsAt,
      collectionsRemaining: isMembership ? termWeeks : null,
      customerName: input.customer.name,
      customerEmail: input.customer.email,
      customerPhone: input.customer.phone,
      customerId: input.customer.id,
      deliveryAddressLine1: input.delivery.line1,
      deliverySuburb: input.delivery.suburb,
      deliveryPostcode: input.delivery.postcode,
      deliveryNotes: input.delivery.notes,
      manageToken,
    },
  });

  return {
    square: {
      manageToken,
      managePath: subscriptionManagePath(offer.stand.slug, manageToken),
      applicationId,
      locationId: input.rail.locationId,
      amountCents,
      currency: offer.currency,
      customerName: input.customer.name,
      customerEmail: input.customer.email,
    },
  };
}
