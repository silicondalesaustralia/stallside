"use server";

import { prisma } from "@/lib/prisma";
import {
  PaymentMethod,
  PaymentStatus,
  ReceiptChannel,
} from "@/generated/prisma/client";
import { loadStandCart, type CartItemInput } from "@/lib/checkout";
import { isDemoStandSlug } from "@/lib/demo";
import { appBaseUrl, getStripe, isStripeConfigured } from "@/lib/stripe";
import { resolveDemoCardStripe } from "@/lib/stripe-demo";
import { PLATFORM_FEE_BPS } from "@/lib/constants";
import { platformFeeCents } from "@/lib/money";
import { ownerHasCardTierAccess } from "@/lib/owner-trial";

export async function startCardCheckout(input: {
  standSlug: string;
  items: CartItemInput[];
}) {
  try {
    const loaded = await loadStandCart(input.standSlug, input.items);
    if ("error" in loaded) return { error: loaded.error };

    const { stand, lineData, totalCents } = loaded;
    const owner = stand.owner;
    const ownerUser = await prisma.user.findUnique({
      where: { id: owner.userId },
      select: { email: true, role: true },
    });
    const demo = isDemoStandSlug(stand.slug);

  if (!stand.acceptCard) {
      return { error: "Card is not enabled at this stand." };
    }
    if (
      !ownerHasCardTierAccess(owner, {
        email: ownerUser?.email,
        role: ownerUser?.role,
      })
    ) {
      return { error: "Card / Tap & Go requires the Card plan." };
    }

    const demoStripe = demo ? resolveDemoCardStripe(owner) : null;
    if (demo) {
      if (!demoStripe) {
        return {
          error:
            "Demo card checkout needs STRIPE_SECRET_KEY_TEST (or sk_test platform key) and a test Connect account.",
        };
      }
    } else {
      if (!isStripeConfigured()) {
        return { error: "Card payments are not configured yet." };
      }
      if (!owner.stripeAccountId || !owner.stripeChargesEnabled) {
        return {
          error:
            "This stand cannot take card payments yet (Stripe not connected).",
        };
      }
    }

    const stripe = demoStripe?.stripe ?? getStripe();
    const stripeAccountId =
      demoStripe?.stripeAccountId ?? owner.stripeAccountId!;

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
          demo: demo ? "1" : "0",
          stripeAccountId,
        },
        payment_intent_data: {
          metadata: { orderId: order.id },
        },
      },
      { stripeAccount: stripeAccountId },
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
