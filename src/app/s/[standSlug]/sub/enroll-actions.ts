"use server";

import { HandoverMode, ShopperSubStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { appBaseUrl, isStripeConfigured } from "@/lib/stripe";
import {
  newManageToken,
  shopperSubApplicationFeePercent,
} from "@/lib/shopper-subscription-fee";
import { createShopperSubCheckoutSession } from "@/lib/shopper-subscription-stripe";
import { subscriptionOfferPath } from "@/lib/subscription-offer";
import { standOffersCard } from "@/lib/stand-payment-brands";

export async function startShopperSubscriptionCheckout(input: {
  standSlug: string;
  offerSlug: string;
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
    if (!offer || offer.items.length === 0) {
      return { error: "This subscription is not available." };
    }
    if (!offer.stripePriceId) {
      return { error: "This subscription is not ready for signup yet." };
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

    const manageToken = newManageToken();
    const shopperSub = await prisma.shopperSubscription.create({
      data: {
        offerId: offer.id,
        standId: stand.id,
        ownerId: owner.id,
        status: ShopperSubStatus.INCOMPLETE,
        customerName,
        customerEmail,
        customerPhone,
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

    try {
      const { ensureCustomer } = await import("@/lib/catalogue/customers");
      const customer = await ensureCustomer({
        ownerId: owner.id,
        email: customerEmail,
        name: customerName,
        phone: customerPhone,
        source: "subscription",
      });
      if (customer) {
        await prisma.shopperSubscription.update({
          where: { id: shopperSub.id },
          data: { customerId: customer.id },
        });
      }
    } catch (err) {
      console.error("Customer link failed", err);
    }

    const base = appBaseUrl();
    const path = subscriptionOfferPath(stand.slug, offer.slug);
    const feePercent = shopperSubApplicationFeePercent(owner);

    const session = await createShopperSubCheckoutSession({
      stripeAccountId: owner.stripeAccountId,
      priceId: offer.stripePriceId,
      customerEmail,
      successUrl: `${base}/checkout/success?sub=${shopperSub.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${base}${path}?cancelled=1`,
      applicationFeePercent: feePercent,
      metadata: {
        purpose: "shopper_subscription",
        shopperSubscriptionId: shopperSub.id,
        offerId: offer.id,
        standId: stand.id,
        ownerId: owner.id,
        stripeAccountId: owner.stripeAccountId,
      },
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
