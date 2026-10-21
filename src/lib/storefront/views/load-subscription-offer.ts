import { prisma } from "@/lib/prisma";
import { publicStandBranding } from "@/lib/public-stand-branding";
import { membershipOfferReady, weekdayLabel, type MembershipPlan } from "@/lib/subscription-offer";
import { standOffersStripeRecurring } from "@/lib/stand-payment-brands";
import { squareMembershipPlans, squareOfferReady, squareSubscriptionRail } from "@/lib/square-subscriptions/rail";
import { countHoldingMembers, isOfferAtCapacity, spotsLeft } from "@/lib/subscription-capacity";
import { HandoverMode, SubscriptionOfferKind } from "@/generated/prisma/client";
import type { SubscriptionOfferData } from "./subscription-offer-types";

/** One active offer by stand and slug, or the stand's first active offer when no slug is given. */
async function findOffer(where: { standSlug?: string; standId?: string; offerSlug?: string }) {
  return prisma.subscriptionOffer.findFirst({
    where: {
      isActive: true,
      ...(where.offerSlug ? { slug: decodeURIComponent(where.offerSlug).trim().toLowerCase() } : {}),
      ...(where.standId ? { standId: where.standId } : {}),
      ...(where.standSlug ? { stand: { slug: decodeURIComponent(where.standSlug).trim().toLowerCase(), isActive: true } } : {}),
    },
    include: {
      stand: { include: { owner: true } },
      items: { orderBy: { sortOrder: "asc" }, include: { product: true } },
    },
    orderBy: { title: "asc" },
  });
}

/** A subscription or membership offer page's data: prices, plans, spots left and whether sign-up is open. */
export async function loadSubscriptionOffer(where: {
  standSlug?: string;
  standId?: string;
  offerSlug?: string;
}): Promise<SubscriptionOfferData | null> {
  const offer = await findOffer(where);
  if (!offer) return null;
  const { stand } = offer;
  const branded = publicStandBranding(stand, stand.owner);
  const squareRail = await squareSubscriptionRail({ stand, owner: stand.owner, offerCurrency: offer.currency });
  const cardEnabled = Boolean(squareRail) || standOffersStripeRecurring(stand, stand.owner);
  const ready = squareRail ? squareOfferReady(offer) : membershipOfferReady(offer);
  const holding = await countHoldingMembers(offer.id);
  const atCapacity = isOfferAtCapacity(offer.maxMembers, holding);
  const isMembership = offer.kind === SubscriptionOfferKind.MEMBERSHIP;

  const plans: { plan: MembershipPlan; priceCents: number }[] = [];
  if (isMembership && squareRail) {
    plans.push(...squareMembershipPlans(offer));
  } else if (isMembership) {
    if (offer.weeklyPriceCents != null && offer.stripeWeeklyPriceId) plans.push({ plan: "WEEKLY", priceCents: offer.weeklyPriceCents });
    if (offer.monthlyPriceCents != null && offer.stripeMonthlyPriceId) plans.push({ plan: "MONTHLY", priceCents: offer.monthlyPriceCents });
    if (offer.upfrontPriceCents != null && offer.stripeUpfrontPriceId) plans.push({ plan: "UPFRONT", priceCents: offer.upfrontPriceCents });
  }

  const unavailableReason = atCapacity
    ? "This membership is full. No more spots are available right now."
    : !cardEnabled
      ? "This stand cannot take card payments yet."
      : !ready
        ? "This offer is not ready for signup yet. The owner needs to save it again after Stripe is connected."
        : null;

  return {
    standSlug: stand.slug,
    standName: branded.name,
    accentColor: branded.accentColor ?? null,
    isMembership,
    offer: {
      slug: offer.slug,
      title: offer.title,
      description: offer.description,
      imageUrl: offer.imageUrl,
      currency: offer.currency,
      interval: offer.interval,
      priceCents: offer.priceCents,
      termWeeks: offer.termWeeks,
      weeklyPriceCents: offer.weeklyPriceCents,
      monthlyPriceCents: offer.monthlyPriceCents,
      upfrontPriceCents: offer.upfrontPriceCents,
      upfrontBenefitsText: offer.upfrontBenefitsText,
      termsText: offer.termsText,
      collectionNote: offer.collectionNote,
      handoverCollect: offer.handoverMode === HandoverMode.COLLECT,
      handoverDeliver: offer.handoverMode === HandoverMode.DELIVER,
    },
    collectionDayLabel: weekdayLabel(offer.collectionWeekday),
    plans,
    lines: offer.items.map((i) => ({
      name: i.product.name,
      quantity: i.quantity,
      lineTotalCents: i.product.priceCents * i.quantity,
    })),
    spotsLeft: spotsLeft(offer.maxMembers, holding),
    unavailableReason,
  };
}
