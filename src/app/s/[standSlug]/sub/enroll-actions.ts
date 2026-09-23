"use server";

import {
  HandoverMode,
  MembershipBillingPlan,
  ShopperSubStatus,
  SubscriptionOfferKind,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { appBaseUrl, isStripeConfigured } from "@/lib/stripe";
import {
  newManageToken,
  shopperSubApplicationFeePercent,
} from "@/lib/shopper-subscription-fee";
import { createShopperSubCheckoutSession } from "@/lib/shopper-subscription-stripe";
import {
  createMembershipTermCheckoutSession,
  createMembershipUpfrontCheckoutSession,
} from "@/lib/membership-subscription-stripe";
import {
  membershipOfferReady,
  membershipTermEndsAt,
  parseMembershipBillingPlan,
  subscriptionOfferPath,
} from "@/lib/subscription-offer";
import {
  countHoldingMembers,
  isOfferAtCapacity,
} from "@/lib/subscription-capacity";
import { standOffersCard } from "@/lib/stand-payment-brands";

export async function startShopperSubscriptionCheckout(input: {
  standSlug: string;
  offerSlug: string;
  billingPlan?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  deliveryAddressLine1?: string;
  deliverySuburb?: string;
  deliveryPostcode?: string;
  deliveryNotes?: string;
}) {
  try {
    const customerName = input.customerName.trim().slice(0, 120);
    const customerEmail = input.customerEmail.trim().toLowerCase().slice(0, 200);
    const customerPhone =
      (input.customerPhone ?? "").trim().slice(0, 40) || null;

    if (!customerName) return { error: "Enter your name." };
    if (!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return { error: "Enter a valid email." };
    }
    if (!isStripeConfigured()) {
      return { error: "Card payments are not configured yet." };
    }

    const standKey = input.standSlug.trim().toLowerCase();
    const offerKey = input.offerSlug.trim().toLowerCase();

    const offer = await prisma.subscriptionOffer.findFirst({
      where: {
        slug: offerKey,
        isActive: true,
        stand: { slug: standKey, isActive: true },
      },
      include: {
        stand: { include: { owner: true } },
        items: true,
      },
    });
    if (!offer) return { error: "This subscription is not available." };
    if (!membershipOfferReady(offer)) {
      return { error: "This subscription is not ready for signup yet." };
    }

    const holding = await countHoldingMembers(offer.id);
    if (isOfferAtCapacity(offer.maxMembers, holding)) {
      return {
        error: "This membership is full. No more spots are available right now.",
      };
    }

    const { stand } = offer;
    const { owner } = stand;
    if (!standOffersCard(stand, owner)) {
      return { error: "This stand cannot take card subscriptions yet." };
    }
    if (!owner.stripeAccountId || !owner.stripeChargesEnabled) {
      return { error: "Stripe is not connected for this stand." };
    }

    if (offer.handoverMode === HandoverMode.DELIVER) {
      const line1 = (input.deliveryAddressLine1 ?? "").trim().slice(0, 200);
      const suburb = (input.deliverySuburb ?? "").trim().slice(0, 100);
      const postcode = (input.deliveryPostcode ?? "").trim().slice(0, 20);
      if (!line1 || !suburb || !postcode) {
        return { error: "Enter a delivery address." };
      }
    }

    const isMembership = offer.kind === SubscriptionOfferKind.MEMBERSHIP;
    if (!isMembership && offer.items.length === 0) {
      return { error: "This subscription is not available." };
    }

    let billingPlan: MembershipBillingPlan | null = null;
    let priceId: string | null = offer.stripePriceId;
    let priceCents = offer.priceCents;
    let cancelAtUnix: number | null = null;
    let termEndsAt: Date | null = null;
    let collectionsRemaining: number | null = null;

    if (isMembership) {
      const plan = parseMembershipBillingPlan(input.billingPlan);
      if (!plan) return { error: "Choose a payment plan." };
      billingPlan = plan as MembershipBillingPlan;
      const termWeeks = offer.termWeeks ?? 26;
      termEndsAt = membershipTermEndsAt(new Date(), termWeeks);
      collectionsRemaining = termWeeks;
      cancelAtUnix = Math.floor(termEndsAt.getTime() / 1000);

      if (plan === "WEEKLY") {
        if (!offer.stripeWeeklyPriceId || offer.weeklyPriceCents == null) {
          return { error: "Weekly plan is not available." };
        }
        priceId = offer.stripeWeeklyPriceId;
        priceCents = offer.weeklyPriceCents;
      } else if (plan === "MONTHLY") {
        if (!offer.stripeMonthlyPriceId || offer.monthlyPriceCents == null) {
          return { error: "Monthly plan is not available." };
        }
        priceId = offer.stripeMonthlyPriceId;
        priceCents = offer.monthlyPriceCents;
      } else {
        if (!offer.stripeUpfrontPriceId || offer.upfrontPriceCents == null) {
          return { error: "Pay-in-full is not available." };
        }
        priceId = offer.stripeUpfrontPriceId;
        priceCents = offer.upfrontPriceCents;
      }
    }

    if (!priceId) {
      return { error: "This subscription is not ready for signup yet." };
    }

    const manageToken = newManageToken();
    let customerId: string | null = null;
    try {
      const { ensureCustomer } = await import("@/lib/catalogue/customers");
      const customer = await ensureCustomer({
        ownerId: owner.id,
        email: customerEmail,
        name: customerName,
        phone: customerPhone,
        source: "subscription",
      });
      customerId = customer?.id ?? null;
    } catch (error) {
      console.error("Ensure customer for subscription failed", error);
    }
    const shopperSub = await prisma.shopperSubscription.create({
      data: {
        offerId: offer.id,
        standId: stand.id,
        ownerId: owner.id,
        status: ShopperSubStatus.INCOMPLETE,
        billingPlan,
        termEndsAt,
        collectionsRemaining,
        paidThroughAt: billingPlan === "UPFRONT" ? termEndsAt : null,
        customerName,
        customerEmail,
        customerPhone,
        customerId,
        deliveryAddressLine1:
          (input.deliveryAddressLine1 ?? "").trim().slice(0, 200) || null,
        deliverySuburb:
          (input.deliverySuburb ?? "").trim().slice(0, 100) || null,
        deliveryPostcode:
          (input.deliveryPostcode ?? "").trim().slice(0, 20) || null,
        deliveryNotes:
          (input.deliveryNotes ?? "").trim().slice(0, 200) || null,
        manageToken,
      },
    });

    const base = appBaseUrl();
    const path = subscriptionOfferPath(stand.slug, offer.slug);
    const feePercent = shopperSubApplicationFeePercent(owner);
    const metadata = {
      purpose: "shopper_subscription",
      shopperSubscriptionId: shopperSub.id,
      offerId: offer.id,
      standId: stand.id,
      ownerId: owner.id,
      stripeAccountId: owner.stripeAccountId,
      ...(billingPlan ? { billingPlan } : {}),
    };

    const session =
      isMembership && billingPlan === "UPFRONT"
        ? await createMembershipUpfrontCheckoutSession({
            stripeAccountId: owner.stripeAccountId,
            priceId,
            priceCents,
            customerEmail,
            successUrl: `${base}/checkout/success?sub=${shopperSub.id}&session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${base}${path}?cancelled=1`,
            applicationFeePercent: feePercent,
            metadata,
          })
        : isMembership && cancelAtUnix != null
          ? await createMembershipTermCheckoutSession({
              stripeAccountId: owner.stripeAccountId,
              priceId,
              customerEmail,
              successUrl: `${base}/checkout/success?sub=${shopperSub.id}&session_id={CHECKOUT_SESSION_ID}`,
              cancelUrl: `${base}${path}?cancelled=1`,
              applicationFeePercent: feePercent,
              metadata,
              cancelAtUnix,
            })
          : await createShopperSubCheckoutSession({
              stripeAccountId: owner.stripeAccountId,
              priceId,
              customerEmail,
              successUrl: `${base}/checkout/success?sub=${shopperSub.id}&session_id={CHECKOUT_SESSION_ID}`,
              cancelUrl: `${base}${path}?cancelled=1`,
              applicationFeePercent: feePercent,
              metadata,
            });

    if (!session.url) {
      return { error: "Could not start checkout." };
    }

    await prisma.shopperSubscription.update({
      where: { id: shopperSub.id },
      data: {
        stripeCustomerId:
          typeof session.customer === "string" ? session.customer : null,
      },
    });

    return { url: session.url };
  } catch (error) {
    console.error("Shopper subscription checkout failed", error);
    return { error: "Could not start checkout. Try again." };
  }
}
