"use server";

import { prisma } from "@/lib/prisma";
import {
  PaymentMethod,
  PaymentStatus,
  ReceiptChannel,
} from "@/generated/prisma/client";
import { loadStandCart, type CartItemInput } from "@/lib/checkout";
import { appBaseUrl, getStripe, isStripeConfigured } from "@/lib/stripe";
import { PLATFORM_FEE_BPS } from "@/lib/constants";
import { platformFeeCents } from "@/lib/money";

export async function startCardCheckout(input: {
  standSlug: string;
  items: CartItemInput[];
}) {
  try {
    if (!isStripeConfigured()) {
      return { error: "Card payments are not configured yet." };
    }

    const loaded = await loadStandCart(input.standSlug, input.items);
    if ("error" in loaded) return { error: loaded.error };

    const { stand, lineData, totalCents } = loaded;
    const owner = stand.owner;

    if (!owner.stripeAccountId || !owner.stripeChargesEnabled) {
      return {
        error: "This stand cannot take card payments yet (Stripe not connected).",
      };
    }

    const orderNumber = `FS-${Date.now().toString(36).toUpperCase()}`;
    const trackedFee = platformFeeCents(
      totalCents,
      owner.platformFeePercentBps || PLATFORM_FEE_BPS,
    );

    const order = await prisma.order.create({
      data: {
        standId: stand.id,
        ownerId: stand.ownerId,
        orderNumber,
        paymentMethod: PaymentMethod.CARD,
        paymentStatus: PaymentStatus.PENDING,
        subtotalCents: totalCents,
        totalCents,
        currency: stand.currency,
        platformFeeCents: trackedFee,
        receiptChannel: ReceiptChannel.NONE,
        items: { create: lineData },
      },
    });

    const base = appBaseUrl();
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        payment_method_types: ["card"],
        line_items: lineData.map((line) => ({
          quantity: line.quantity,
          price_data: {
            currency: stand.currency.toLowerCase(),
            unit_amount: line.unitPriceCents,
            product_data: { name: line.productNameSnapshot },
          },
        })),
        success_url: `${base}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${base}/checkout/cancelled?order=${order.id}`,
        metadata: {
          orderId: order.id,
          standId: stand.id,
          ownerId: stand.ownerId,
        },
        payment_intent_data: {
          metadata: { orderId: order.id },
        },
      },
      { stripeAccount: owner.stripeAccountId },
    );

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeCheckoutSessionId: session.id },
    });

    if (!session.url) {
      return { error: "Could not start Stripe Checkout." };
    }

    return { url: session.url };
  } catch (error) {
    console.error("Card checkout failed", error);
    return { error: "Could not start card checkout." };
  }
}
