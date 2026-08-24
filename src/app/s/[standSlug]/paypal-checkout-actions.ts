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
  orderItemCreates,
  type CartItemInput,
} from "@/lib/checkout";
import { isPayPalConfigured, isPayPalConnectAvailable } from "@/lib/paypal";
import { createPayPalCheckoutOrder } from "@/lib/paypal-orders";
import { appBaseUrl } from "@/lib/app-url";
import {
  checkoutCancelledUrl,
  orderAccessToken,
} from "@/lib/order-access-token";
import { computeVendlApplicationFee } from "@/lib/stallside-fee";

export async function startPayPalCheckout(input: {
  standSlug: string;
  items?: CartItemInput[];
  customerChoiceAmountCents?: number;
  customerEmail?: string;
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
    const trackedFee = computeVendlApplicationFee(totalCents, owner);

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
        totalCents,
        currency: stand.currency,
        platformFeeCents: trackedFee,
        receiptChannel: email ? ReceiptChannel.EMAIL : ReceiptChannel.NONE,
        receiptEmail: email || null,
        items: { create: orderItemCreates(lineData) },
      },
    });

    const base = appBaseUrl();
    const { paypalOrderId, approveUrl } = await createPayPalCheckoutOrder({
      merchantId: owner.paypalMerchantId,
      orderId: order.id,
      currency: stand.currency,
      totalCents,
      description: `${stand.name} · ${orderNumber}`,
      successUrl: `${base}/checkout/success?order_id=${order.id}&paypal=1`,
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
