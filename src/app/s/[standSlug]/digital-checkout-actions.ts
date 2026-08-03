"use server";

import { prisma } from "@/lib/prisma";
import {
  CollectionStatus,
  PaymentMethod,
  PaymentStatus,
  ReceiptChannel,
} from "@/generated/prisma/client";
import { loadStandCart, type CartItemInput } from "@/lib/checkout";
import { isDemoStandSlug } from "@/lib/demo";
import { appBaseUrl, getStripe, isStripeConfigured } from "@/lib/stripe";
import { resolveDemoCardStripe } from "@/lib/stripe-demo";
import {
  computeStallsideApplicationFee,
  ownerPassesFeeToCustomer,
} from "@/lib/stallside-fee";

export async function startCardCheckout(input: {
  standSlug: string;
  items: CartItemInput[];
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}) {
  try {
    const loaded = await loadStandCart(input.standSlug, input.items);
    if ("error" in loaded) return { error: loaded.error };

    const { stand, lineData, totalCents, preOrderCart } = loaded;
    const owner = stand.owner;
    const ownerUser = await prisma.user.findUnique({
      where: { id: owner.userId },
      select: { email: true, role: true },
    });
    const demo = isDemoStandSlug(stand.slug);
    const access = { email: ownerUser?.email, role: ownerUser?.role };

    if (!stand.acceptCard) {
      return { error: "Card is not enabled at this stand." };
    }

    const customerName = (input.customerName ?? "").trim().slice(0, 120);
    const customerEmail = (input.customerEmail ?? "")
      .trim()
      .toLowerCase()
      .slice(0, 200);
    const customerPhone = (input.customerPhone ?? "").trim().slice(0, 40) || null;
    if (preOrderCart && !customerName) {
      return { error: "Enter your name for collection." };
    }
    if (preOrderCart) {
      if (!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
        return { error: "Enter a valid email for order details." };
      }
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

    const applicationFee = computeStallsideApplicationFee(
      totalCents,
      owner,
      access,
    );
    const passOn = applicationFee > 0 && ownerPassesFeeToCustomer(owner);
    const chargeTotal = totalCents + (passOn ? applicationFee : 0);

    const orderNumber = `FS-${Date.now().toString(36).toUpperCase()}`;

    const order = await prisma.order.create({
      data: {
        standId: stand.id,
        ownerId: stand.ownerId,
        orderNumber,
        paymentMethod: PaymentMethod.CARD,
        paymentStatus: PaymentStatus.PENDING,
        subtotalCents: totalCents,
        totalCents: chargeTotal,
        currency: stand.currency,
        platformFeeCents: applicationFee,
        receiptChannel: customerEmail
          ? ReceiptChannel.EMAIL
          : ReceiptChannel.NONE,
        receiptEmail: customerEmail || null,
        items: { create: lineData },
        ...(preOrderCart
          ? {
              isPreOrder: true,
              collectionAt: preOrderCart.collectionAt,
              collectionNote: preOrderCart.collectionNote,
              customerName,
              customerPhone,
              collectionStatus: CollectionStatus.ORDERED,
            }
          : {}),
      },
    });

    const base = appBaseUrl();
    const lineItems = lineData.map((line) => ({
      quantity: line.quantity,
      price_data: {
        currency: stand.currency.toLowerCase(),
        unit_amount: line.unitPriceCents,
        product_data: {
          name: line.optionsSnapshot
            ? `${line.productNameSnapshot} (${line.optionsSnapshot})`
            : line.productNameSnapshot,
        },
      },
    }));
    if (passOn && applicationFee > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: stand.currency.toLowerCase(),
          unit_amount: applicationFee,
          product_data: { name: "Card fee" },
        },
      });
    }

    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        payment_method_types: ["card"],
        line_items: lineItems,
        success_url: `${base}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${base}/checkout/cancelled?order=${order.id}`,
        ...(customerEmail ? { customer_email: customerEmail } : {}),
        metadata: {
          orderId: order.id,
          standId: stand.id,
          ownerId: stand.ownerId,
          demo: demo ? "1" : "0",
          stripeAccountId,
        },
        payment_intent_data: {
          metadata: { orderId: order.id },
          ...(applicationFee > 0
            ? { application_fee_amount: applicationFee }
            : {}),
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
    const stripeMessage =
      error &&
      typeof error === "object" &&
      "message" in error &&
      typeof (error as { message: unknown }).message === "string"
        ? (error as { message: string }).message
        : null;
    if (process.env.NODE_ENV !== "production" && stripeMessage) {
      return { error: stripeMessage };
    }
    return { error: "Could not start card checkout." };
  }
}
