"use server";

import { prisma } from "@/lib/prisma";
import {
  PaymentMethod,
  PaymentStatus,
  ReceiptChannel,
} from "@/generated/prisma/client";
import {
  loadCustomerChoiceCheckout,
  loadStandCart,
  type CartItemInput,
} from "@/lib/checkout";
import { orderLineFields } from "@/lib/order-gst";
import { isPayPalConfigured, isPayPalConnectAvailable } from "@/lib/paypal";
import { createPayPalCheckoutOrder } from "@/lib/paypal-orders";
import { checkoutSuccessUrl } from "@/lib/storefront/checkout-return-url";
import {
  checkoutCancelledUrl,
  orderAccessToken,
} from "@/lib/order-access-token";
import { computeVendlCheckoutFees } from "@/lib/stallside-fee";
import { loadedCartHandover } from "@/lib/fulfilment/cart-handover";
import { DELIVERY_NEEDS_CARD } from "@/lib/fulfilment/handover-choice";

export async function startPayPalCheckout(input: {
  standSlug: string;
  items?: CartItemInput[];
  customerChoiceAmountCents?: number;
  customerEmail?: string;
  couponCode?: string | null;
}) {
  try {
    if (!isPayPalConfigured() || !isPayPalConnectAvailable()) {
      return { error: "PayPal is not available yet." };
    }

    const email = (input.customerEmail ?? "").trim().toLowerCase();
    const amount = input.customerChoiceAmountCents;
    if (amount != null && input.items?.length) {
      return { error: "Invalid checkout payload." };
    }
    const loaded =
      amount != null
        ? await loadCustomerChoiceCheckout(input.standSlug, amount)
        : await loadStandCart(input.standSlug, input.items ?? [], {
            receiptEmail: email || null,
            claimFirstOrder: Boolean(email),
            couponCode: input.couponCode,
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
    if (preOrderCart) {
      return { error: "Pre-orders must be paid by card." };
    }
    const handover = loadedCartHandover(loaded, input.items);
    if ("error" in handover) return { error: handover.error };
    if (handover.mode !== "COLLECT") return { error: DELIVERY_NEEDS_CARD };
    const owner = stand.owner;

    if (!stand.acceptPayPal) {
      return { error: "PayPal is not enabled at this stand." };
    }
    if (
      !owner.paypalMerchantId ||
      !owner.paypalOnboardingComplete ||
      !owner.paypalPaymentsEnabled
    ) {
      return {
        error: "This stand cannot take PayPal yet (PayPal not connected).",
      };
    }

    const orderNumber = `FS-${Date.now().toString(36).toUpperCase()}`;
    const { applicationFeeCents: trackedFee } = computeVendlCheckoutFees(
      totalCents,
      owner,
      { rail: "paypal", currency: stand.currency },
    );

    const order = await prisma.order.create({
      data: {
        standId: stand.id,
        ownerId: stand.ownerId,
        orderNumber,
        paymentMethod: PaymentMethod.PAYPAL,
        paymentStatus: PaymentStatus.PENDING,
        subtotalCents,
        discountCents,
        discountLabel,
        promotionId: loaded.promotionId,
        promotionCodeSnapshot: loaded.promotionCode,
        totalCents,
        currency: stand.currency,
        platformFeeCents: trackedFee,
        receiptChannel: email ? ReceiptChannel.EMAIL : ReceiptChannel.NONE,
        receiptEmail: email || null,
        ...orderLineFields(lineData, discountCents, stand),
      },
    });

    const successUrl = await checkoutSuccessUrl(stand.slug, amount != null);
    const { paypalOrderId, approveUrl } = await createPayPalCheckoutOrder({
      merchantId: owner.paypalMerchantId,
      orderId: order.id,
      currency: stand.currency,
      totalCents,
      description: `${stand.name} · ${orderNumber}`,
      successUrl: `${successUrl}?order_id=${order.id}&paypal=1`,
      cancelUrl: checkoutCancelledUrl(order.id),
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { paypalOrderId },
    });

    return {
      orderId: order.id,
      cancelToken: orderAccessToken(order.id, "cancel"),
      paypalOrderId,
      url: approveUrl,
    };
  } catch (error) {
    console.error("PayPal checkout failed", error);
    return { error: "Could not start PayPal checkout." };
  }
}
