"use server";

import { prisma } from "@/lib/prisma";
import {
  PaymentMethod,
  PaymentStatus,
  ReceiptChannel,
} from "@/generated/prisma/client";
import { loadStandCart, type CartItemInput } from "@/lib/checkout";
import { isPayPalConfigured, isPayPalConnectAvailable } from "@/lib/paypal";
import { createPayPalCheckoutOrder } from "@/lib/paypal-orders";
import { appBaseUrl } from "@/lib/app-url";
import { computeStallsideApplicationFee } from "@/lib/stallside-fee";

export async function startPayPalCheckout(input: {
  standSlug: string;
  items: CartItemInput[];
}) {
  try {
    if (!isPayPalConfigured() || !isPayPalConnectAvailable()) {
      return { error: "PayPal is not available yet." };
    }

    const loaded = await loadStandCart(input.standSlug, input.items);
    if ("error" in loaded) return { error: loaded.error };

    const { stand, lineData, totalCents, preOrderCart } = loaded;
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
    // Track Stallside fee for Free only; Pro / lifetime store 0.
    const trackedFee = computeStallsideApplicationFee(totalCents, owner);

    const order = await prisma.order.create({
      data: {
        standId: stand.id,
        ownerId: stand.ownerId,
        orderNumber,
        paymentMethod: PaymentMethod.PAYPAL,
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
    const { paypalOrderId, approveUrl } = await createPayPalCheckoutOrder({
      merchantId: owner.paypalMerchantId,
      orderId: order.id,
      currency: stand.currency,
      totalCents,
      description: `${stand.name} · ${orderNumber}`,
      successUrl: `${base}/checkout/success?order_id=${order.id}&paypal=1`,
      cancelUrl: `${base}/checkout/cancelled?order=${order.id}`,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { paypalOrderId },
    });

    return {
      orderId: order.id,
      paypalOrderId,
      url: approveUrl,
    };
  } catch (error) {
    console.error("PayPal checkout failed", error);
    return { error: "Could not start PayPal checkout." };
  }
}
