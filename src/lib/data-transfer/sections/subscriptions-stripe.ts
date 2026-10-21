import { prisma } from "@/lib/prisma";
import { SubscriptionOfferKind, type SubscriptionOffer } from "@/generated/prisma/client";
import { isStripeConfigured } from "@/lib/stripe";
import { syncOfferStripePrice } from "@/lib/shopper-subscription-stripe";
import { syncMembershipStripePrices } from "@/lib/membership-subscription-stripe";
import type { DataContext } from "../context";

/** Same Stripe price setup as saving the offer by hand; skipped when Stripe isn't connected. */
export async function syncImportedOfferStripe(
  offer: SubscriptionOffer,
  ctx: DataContext,
  warn: (message: string) => void,
) {
  if (!isStripeConfigured() || !ctx.stripeAccountId || !ctx.stripeChargesEnabled) {
    warn(`"${offer.title}" saved; connect Stripe and save it once to take sign-ups`);
    return;
  }
  try {
    if (offer.kind === SubscriptionOfferKind.BOX) {
      const synced = await syncOfferStripePrice({
        stripeAccountId: ctx.stripeAccountId,
        title: offer.title,
        currency: offer.currency,
        priceCents: offer.priceCents,
        interval: offer.interval,
        existingProductId: offer.stripeProductId,
        existingPriceId: offer.stripePriceId,
      });
      await prisma.subscriptionOffer.update({
        where: { id: offer.id },
        data: { stripeProductId: synced.productId, stripePriceId: synced.priceId },
      });
      return;
    }
    const synced = await syncMembershipStripePrices({
      stripeAccountId: ctx.stripeAccountId,
      title: offer.title,
      currency: offer.currency,
      existingProductId: offer.stripeProductId,
      weeklyPriceCents: offer.weeklyPriceCents,
      monthlyPriceCents: offer.monthlyPriceCents,
      upfrontPriceCents: offer.upfrontPriceCents,
      existingWeeklyPriceId: offer.stripeWeeklyPriceId,
      existingMonthlyPriceId: offer.stripeMonthlyPriceId,
      existingUpfrontPriceId: offer.stripeUpfrontPriceId,
    });
    await prisma.subscriptionOffer.update({
      where: { id: offer.id },
      data: {
        stripeProductId: synced.productId,
        stripeWeeklyPriceId: synced.weeklyPriceId,
        stripeMonthlyPriceId: synced.monthlyPriceId,
        stripeUpfrontPriceId: synced.upfrontPriceId,
        stripePriceId: synced.weeklyPriceId ?? synced.monthlyPriceId,
      },
    });
  } catch (error) {
    console.error("Stripe price sync failed for imported offer", error);
    warn(`"${offer.title}" saved, but Stripe price sync failed; open it and save again`);
  }
}
