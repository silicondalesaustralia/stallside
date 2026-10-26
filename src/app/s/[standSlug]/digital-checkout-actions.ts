"use server";

import { prisma } from "@/lib/prisma";
import {
  CollectionStatus,
  HandoverMode,
  PaymentMethod,
  PaymentStatus,
  PaymentTiming,
  ReceiptChannel,
} from "@/generated/prisma/client";
import {
  loadCustomerChoiceCheckout,
  loadStandCart,
  type CartItemInput,
} from "@/lib/checkout";
import { orderLineFields } from "@/lib/order-gst";
import { isDemoStandSlug } from "@/lib/demo";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { resolveDemoCardStripe, stripeTestSecretKey } from "@/lib/stripe-demo";
import { CARD_CHECKOUT_TTL_SECONDS } from "@/lib/stripe-card-checkout";
import { checkoutCancelledUrl } from "@/lib/order-access-token";
import { checkoutSuccessUrl } from "@/lib/storefront/checkout-return-url";
import { stripePublishableKeyFor } from "@/lib/stripe-publishable-key";
import { cleanEnvSecret } from "@/lib/env";
import { checkoutUiParams, type EmbeddedCheckoutInfo } from "@/lib/stripe-embedded-checkout";
import { ensurePaymentMethodDomain } from "@/lib/stripe-payment-domain";
import { stripeLineItemsFromCart } from "@/lib/stripe-cart-lines";
import { taxConfig } from "@/lib/tax/config";
import { computeVendlCheckoutFees } from "@/lib/stallside-fee";
import { standCheckoutPaymentMethodTypes } from "@/lib/stripe-checkout-methods";
import { getDefaultPaymentMethodConfiguration } from "@/lib/stripe-payment-method-config";
import {
  assertDepositLiabilityOk,
  splitDepositBalance,
} from "@/lib/deposit-order";
import { contactError, loadedCartHandover } from "@/lib/fulfilment/cart-handover";
import { loadedCartShippingCents } from "@/lib/shipping/cart-shipping";
import { shippingTax } from "@/lib/tax/shipping-tax";
import { parseHandover, type HandoverValue } from "@/lib/fulfilment/handover-choice";

export async function startCardCheckout(input: {
  standSlug: string;
  items?: CartItemInput[];
  customerChoiceAmountCents?: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  deliveryAddressLine1?: string;
  deliverySuburb?: string;
  deliveryPostcode?: string;
  deliveryNotes?: string;
  /** Shopper's pick when the cart allows both pickup and delivery. */
  handoverMode?: HandoverValue;
  /** The shop's button colour (#RRGGBB) for Stripe's Pay button. */
  buttonColour?: string;
  /** Show Stripe Checkout inside the page when possible (else redirect). */
  embedded?: boolean;
  couponCode?: string | null;
}): Promise<{ error: string } | { url: string } | { embedded: EmbeddedCheckoutInfo }> {
  try {
    const customerName = (input.customerName ?? "").trim().slice(0, 120);
    const customerEmail = (input.customerEmail ?? "")
      .trim()
      .toLowerCase()
      .slice(0, 200);
    const customerPhone = (input.customerPhone ?? "").trim().slice(0, 40) || null;
    const deliveryAddressLine1 = (input.deliveryAddressLine1 ?? "")
      .trim()
      .slice(0, 200);
    const deliverySuburb = (input.deliverySuburb ?? "").trim().slice(0, 100);
    const deliveryPostcode = (input.deliveryPostcode ?? "").trim().slice(0, 20);
    const deliveryNotes =
      (input.deliveryNotes ?? "").trim().slice(0, 200) || null;

    const amount = input.customerChoiceAmountCents;
    if (amount != null && input.items?.length) {
      return { error: "Invalid checkout payload." };
    }
    const loaded =
      amount != null
        ? await loadCustomerChoiceCheckout(input.standSlug, amount)
        : await loadStandCart(input.standSlug, input.items ?? [], {
            receiptEmail: customerEmail || null,
            claimFirstOrder: Boolean(customerEmail),
            couponCode: input.couponCode,
          });
    if ("error" in loaded) return { error: loaded.error ?? "Could not start card checkout." };

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

    const handover = loadedCartHandover(loaded, input.items, parseHandover(input.handoverMode));
    if ("error" in handover) return { error: handover.error };
    const deliver = handover.mode === HandoverMode.DELIVER;
    const delivery = { deliveryAddressLine1, deliverySuburb, deliveryPostcode, deliveryNotes };
    const contactProblem = contactError({
      needsContact: Boolean(preOrderCart) || deliver,
      deliver,
      customerName,
      customerEmail,
      delivery,
    });
    if (contactProblem) return { error: contactProblem };
    const buttonColour = /^#[0-9a-f]{6}$/i.test(input.buttonColour ?? "") ? input.buttonColour : null;

    const depositMode =
      preOrderCart?.paymentTiming === PaymentTiming.DEPOSIT_THEN_BALANCE;
    const depositPct = preOrderCart?.depositPercent ?? 30;
    const { depositCents, balanceCents } = depositMode
      ? splitDepositBalance(totalCents, depositPct)
      : { depositCents: totalCents, balanceCents: 0 };

    if (depositMode) {
      const liability = await assertDepositLiabilityOk(
        stand.ownerId,
        depositCents,
      );
      if (!liability.ok) return { error: liability.error };
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

    const shippingCents = loadedCartShippingCents(loaded, deliver);
    const shipTax = shippingTax(loaded.taxRule, owner.taxShipping, shippingCents);
    const addedTaxCents = loaded.taxAddedCents + shipTax.addedCents;
    const lineFields = orderLineFields(lineData, discountCents, loaded.taxRule);
    const chargeGoodsCents = depositMode
      ? depositCents
      : totalCents + shippingCents + shipTax.addedCents;
    const {
      applicationFeeCents: applicationFee,
      chargeTotalCents: chargeTotal,
      passedOn: passOn,
    } =
      computeVendlCheckoutFees(chargeGoodsCents, owner, {
        rail: "stripe",
        currency: stand.currency,
      });

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
        promotionId: loaded.promotionId,
        promotionCodeSnapshot: loaded.promotionCode,
        totalCents: depositMode
          ? totalCents + (passOn ? applicationFee : 0)
          : chargeTotal,
        currency: stand.currency,
        platformFeeCents: applicationFee,
        receiptChannel: customerEmail
          ? ReceiptChannel.EMAIL
          : ReceiptChannel.NONE,
        receiptEmail: customerEmail || null,
        ...lineFields,
        gstCents: lineFields.gstCents + shipTax.recordedCents,
        ...(preOrderCart
          ? {
              isPreOrder: true,
              collectionAt: preOrderCart.collectionAt,
              collectionNote: preOrderCart.collectionNote,
              customerName,
              customerPhone,
              collectionStatus: CollectionStatus.ORDERED,
              paymentTiming: preOrderCart.paymentTiming,
              ...(depositMode
                ? {
                    depositCents,
                    balanceCents,
                    balanceDueAt: preOrderCart.collectionAt,
                  }
                : {}),
            }
          : { paymentTiming: PaymentTiming.PAY_NOW }),
        handoverMode: handover.mode,
        shippingCents,
        ...(deliver ? { customerName, customerPhone, ...delivery } : {}),
      },
    });

    const successUrl = await checkoutSuccessUrl(stand.slug, amount != null);
    let lineItems = stripeLineItemsFromCart(lineData, stand.currency);
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

    if (addedTaxCents > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: stand.currency.toLowerCase(),
          unit_amount: addedTaxCents,
          product_data: { name: taxConfig(owner, stand.currency).name },
        },
      });
    }

    if (depositMode) {
      // Single deposit line - vault card for balance via setup_future_usage.
      lineItems = [
        {
          quantity: 1,
          price_data: {
            currency: stand.currency.toLowerCase(),
            unit_amount: depositCents,
            product_data: {
              name: `Deposit (${depositPct}%) - balance charged before handover`,
            },
          },
        },
      ];
    }

    if (shippingCents > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: stand.currency.toLowerCase(),
          unit_amount: shippingCents,
          product_data: { name: "Shipping" },
        },
      });
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

    const publishableKey = input.embedded
      ? stripePublishableKeyFor(demo ? stripeTestSecretKey() : cleanEnvSecret(process.env.STRIPE_SECRET_KEY))
      : null;
    if (publishableKey) await ensurePaymentMethodDomain(stripe, stripeAccountId);
    const sessionParams = {
      mode: "payment" as const,
      line_items: lineItems.filter((l) => l.price_data.unit_amount > 0),
      ...checkoutUiParams(publishableKey, successUrl, checkoutCancelledUrl(order.id)),
      expires_at: Math.floor(Date.now() / 1000) + CARD_CHECKOUT_TTL_SECONDS,
      ...(customerEmail ? { customer_email: customerEmail } : {}),
      ...(deliver ? { billing_address_collection: "required" as const } : {}),
      ...(buttonColour ? { branding_settings: { button_color: buttonColour } } : {}),
      metadata: {
        orderId: order.id,
        standId: stand.id,
        ownerId: stand.ownerId,
        demo: demo ? "1" : "0",
        stripeAccountId,
        deposit: depositMode ? "1" : "0",
      },
      payment_intent_data: {
        metadata: {
          orderId: order.id,
          kind: depositMode ? "deposit" : "full",
        },
        ...(applicationFee > 0
          ? { application_fee_amount: applicationFee }
          : {}),
        ...(depositMode ? { setup_future_usage: "off_session" as const } : {}),
      },
    };

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

    if (publishableKey && session.client_secret) {
      return { embedded: { clientSecret: session.client_secret, publishableKey, stripeAccountId } };
    }
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
    if ((error as { code?: unknown } | null)?.code === "account_invalid") {
      return { error: "Card payments aren't available for this shop right now. Please choose another way to pay." };
    }
    return { error: "Could not start card checkout." };
  }
}
