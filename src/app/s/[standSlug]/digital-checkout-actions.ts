"use server";

import { prisma } from "@/lib/prisma";
import {
  CollectionStatus,
  PaymentMethod,
  PaymentStatus,
  ReceiptChannel,
} from "@/generated/prisma/client";
import {
  loadStandCart,
  orderItemCreates,
  type CartItemInput,
} from "@/lib/checkout";
import { isDemoStandSlug } from "@/lib/demo";
import { appBaseUrl, getStripe, isStripeConfigured } from "@/lib/stripe";
import { resolveDemoCardStripe } from "@/lib/stripe-demo";
import { stripeLineItemsFromCart } from "@/lib/stripe-cart-lines";
import {
  computeVendlCheckoutFees,
  ownerPassesFeeToCustomer,
} from "@/lib/stallside-fee";
import { standCheckoutPaymentMethodTypes } from "@/lib/stripe-checkout-methods";
import { getDefaultPaymentMethodConfiguration } from "@/lib/stripe-payment-method-config";

export async function startCardCheckout(input: {
  standSlug: string;
  items: CartItemInput[];
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}) {
  try {
    const customerName = (input.customerName ?? "").trim().slice(0, 120);
    const customerEmail = (input.customerEmail ?? "")
      .trim()
      .toLowerCase()
      .slice(0, 200);
    const customerPhone = (input.customerPhone ?? "").trim().slice(0, 40) || null;

    const loaded = await loadStandCart(input.standSlug, input.items, {
      receiptEmail: customerEmail || null,
      claimFirstOrder: Boolean(customerEmail),
    });
    if ("error" in loaded) return { error: loaded.error };

    const {
      stand,
      lineData,
      subtotalCents,
      discountCents,
      discountLabel,
      totalCents,
      preOrderCart,
    } = loaded;
    const owner = stand.owner;
    const demo = isDemoStandSlug(stand.slug);

    if (!stand.acceptCard) {
      return { error: "Card is not enabled at this stand." };
    }

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

    const { applicationFeeCents: applicationFee, chargeTotalCents: chargeTotal } =
      computeVendlCheckoutFees(totalCents, owner);
    const passOn = applicationFee > 0 && ownerPassesFeeToCustomer(owner);

    const orderNumber = `FS-${Date.now().toString(36).toUpperCase()}`;

    const order = await prisma.order.create({
      data: {
        standId: stand.id,
        ownerId: stand.ownerId,
        orderNumber,
        paymentMethod: PaymentMethod.CARD,
        paymentStatus: PaymentStatus.PENDING,
        subtotalCents,
        discountCents,
        discountLabel,
        totalCents: chargeTotal,
        currency: stand.currency,
        platformFeeCents: applicationFee,
        receiptChannel: customerEmail
          ? ReceiptChannel.EMAIL
          : ReceiptChannel.NONE,
        receiptEmail: customerEmail || null,
        items: { create: orderItemCreates(lineData) },
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
    const lineItems = stripeLineItemsFromCart(lineData, stand.currency);
    if (discountCents > 0 && lineItems.length > 0) {
      let remaining = discountCents;
      for (let i = lineItems.length - 1; i >= 0 && remaining > 0; i--) {
        const amt = lineItems[i].price_data.unit_amount;
        const cut = Math.min(amt, remaining);
        lineItems[i].price_data.unit_amount = amt - cut;
        remaining -= cut;
        if (cut > 0 && discountLabel) {
          lineItems[i].price_data.product_data.name += ` (${discountLabel})`;
        }
      }
    }
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

    const sessionParams = {
      mode: "payment" as const,
      line_items: lineItems.filter((l) => l.price_data.unit_amount > 0),
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
    };

    // Omit payment_method_types on normal sales so the connected account's
    // Payment Method Configuration drives card / PayTo / BNPL / etc.
    // Prefer the Connect child config's parent ID when present (Stripe resolves
    // the child for the connected account).
    const methodTypes = standCheckoutPaymentMethodTypes(Boolean(preOrderCart));
    const pmc = methodTypes
      ? null
      : await getDefaultPaymentMethodConfiguration(stripeAccountId, stripe);
    const session = await stripe.checkout.sessions.create(
      {
        ...sessionParams,
        ...(methodTypes ? { payment_method_types: methodTypes } : {}),
        ...(!methodTypes
          ? {
              // Vendl does not offer Afterpay (unsupported for many stands).
              excluded_payment_method_types: ["afterpay_clearpay"],
            }
          : {}),
        ...(pmc
          ? {
              payment_method_configuration: pmc.parent ?? pmc.id,
            }
          : {}),
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
