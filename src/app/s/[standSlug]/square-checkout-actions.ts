"use server";

import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import {
  CollectionStatus,
  HandoverMode,
  OnlinePaymentProvider,
  PaymentMethod,
  PaymentStatus,
  PaymentTiming,
  ReceiptChannel,
  SaleOrigin,
} from "@/generated/prisma/client";
import {
  loadCustomerChoiceCheckout,
  loadStandCart,
  orderItemCreates,
  type CartItemInput,
} from "@/lib/checkout";
import {
  computeVendlCheckoutFees,
} from "@/lib/stallside-fee";
import { isSquarePaymentsEnabled, squareApplicationId } from "@/lib/square/config";
import {
  getSquareConnection,
  getValidSquareAccessToken,
} from "@/lib/square/connection";
import { createSquarePayment } from "@/lib/square/payments";
import { fulfillPaidSquareOrder } from "@/lib/fulfill-paid-order";
import { saleOriginIncursVendlFee } from "@/lib/commerce/sale-origin";

export async function startSquareCheckout(input: {
  standSlug: string;
  items?: CartItemInput[];
  customerChoiceAmountCents?: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  couponCode?: string | null;
}) {
  try {
    if (!isSquarePaymentsEnabled()) {
      return { error: "Square payments are not enabled." };
    }
    const appId = squareApplicationId();
    if (!appId) return { error: "Square is not configured." };

    const amount = input.customerChoiceAmountCents;
    const loaded =
      amount != null
        ? await loadCustomerChoiceCheckout(input.standSlug, amount)
        : await loadStandCart(input.standSlug, input.items ?? [], {
            receiptEmail: (input.customerEmail ?? "").trim().toLowerCase() || null,
            claimFirstOrder: Boolean(input.customerEmail && !input.couponCode),
            couponCode: input.couponCode ?? null,
          });
    if ("error" in loaded) return { error: loaded.error };

    const { stand, lineData, subtotalCents, discountCents, discountLabel, totalCents, preOrderCart } =
      loaded;
    if (!stand.acceptSquare) {
      return { error: "This stand is not accepting Square." };
    }

    const conn = await getSquareConnection(stand.ownerId);
    if (
      !conn ||
      conn.status !== "ACTIVE" ||
      !conn.paymentsEnabled ||
      !conn.primaryLocationId
    ) {
      return { error: "Seller Square connection is not ready." };
    }
    if (stand.owner.onlinePaymentProvider !== OnlinePaymentProvider.SQUARE) {
      return { error: "Seller is not using Square for online payments." };
    }

    const { applicationFeeCents, chargeTotalCents } = computeVendlCheckoutFees(
      totalCents,
      stand.owner,
    );
    const saleOrigin = SaleOrigin.VENDL_WEB;
    const platformFeeCents = saleOriginIncursVendlFee(saleOrigin)
      ? applicationFeeCents
      : 0;

    const order = await prisma.order.create({
      data: {
        standId: stand.id,
        ownerId: stand.ownerId,
        orderNumber: `FS-${Date.now().toString(36).toUpperCase()}`,
        paymentMethod: PaymentMethod.SQUARE,
        paymentStatus: PaymentStatus.PENDING,
        saleOrigin,
        onlinePaymentProvider: OnlinePaymentProvider.SQUARE,
        subtotalCents,
        totalCents: chargeTotalCents,
        discountCents,
        discountLabel,
        currency: stand.currency,
        platformFeeCents,
        squareLocationId: conn.primaryLocationId,
        receiptEmail: (input.customerEmail ?? "").trim().toLowerCase() || null,
        receiptChannel: input.customerEmail
          ? ReceiptChannel.EMAIL
          : ReceiptChannel.NONE,
        customerName: (input.customerName ?? "").trim().slice(0, 120) || null,
        customerPhone: (input.customerPhone ?? "").trim().slice(0, 40) || null,
        isPreOrder: Boolean(preOrderCart),
        collectionAt: preOrderCart?.collectionAt ?? null,
        collectionNote: preOrderCart?.collectionNote ?? null,
        collectionStatus: preOrderCart ? CollectionStatus.ORDERED : null,
        paymentTiming: preOrderCart?.paymentTiming ?? PaymentTiming.PAY_NOW,
        handoverMode: preOrderCart?.handoverMode ?? HandoverMode.COLLECT,
        items: { create: orderItemCreates(lineData) },
      },
    });

    return {
      orderId: order.id,
      applicationId: appId,
      locationId: conn.primaryLocationId,
      amountCents: chargeTotalCents,
      currency: stand.currency,
      appFeeCents: platformFeeCents,
    };
  } catch (error) {
    console.error("startSquareCheckout failed", error);
    return { error: "Could not start Square checkout." };
  }
}

export async function completeSquareCheckout(input: {
  orderId: string;
  sourceId: string;
}) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: input.orderId },
      include: { owner: true },
    });
    if (!order || order.paymentMethod !== PaymentMethod.SQUARE) {
      return { error: "Order not found." };
    }
    if (order.paymentStatus !== PaymentStatus.PENDING) {
      return { orderNumber: order.orderNumber, alreadyPaid: true as const };
    }
    if (!order.squareLocationId) {
      return { error: "Missing Square location." };
    }

    const conn = await getSquareConnection(order.ownerId);
    if (!conn) return { error: "Square not connected." };
    const token = await getValidSquareAccessToken(conn.id);
    if (!token) return { error: "Square session expired. Reconnect Square." };

    const payment = await createSquarePayment({
      accessToken: token,
      sourceId: input.sourceId,
      amountCents: order.totalCents,
      currency: order.currency,
      locationId: order.squareLocationId,
      idempotencyKey: `vendl-order-pay-${order.id}`,
      appFeeCents: order.platformFeeCents,
      referenceId: order.orderNumber,
      note: `Vendl ${order.orderNumber}`,
      buyerEmail: order.receiptEmail ?? undefined,
    });

    const paymentId = payment.payment?.id;
    const status = payment.payment?.status;
    if (!paymentId || (status !== "COMPLETED" && status !== "APPROVED")) {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: PaymentStatus.FAILED },
      });
      return { error: "Square payment was not completed." };
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        squarePaymentId: paymentId,
        squareOrderId: payment.payment?.order_id ?? null,
      },
    });

    const fulfilled = await fulfillPaidSquareOrder(order.id, paymentId);
    if ("error" in fulfilled && fulfilled.error) {
      return { error: fulfilled.error };
    }
    return {
      orderNumber: fulfilled.orderNumber,
      alreadyPaid: fulfilled.alreadyPaid,
    };
  } catch (error) {
    console.error("completeSquareCheckout failed", error);
    return { error: "Square payment failed." };
  }
}

/** Sandbox helper: complete with a fake-ish path only when source is a test nonce. */
export async function squareCheckoutIdempotencyKey(orderId: string) {
  return `vendl-${orderId}-${randomUUID().slice(0, 8)}`;
}
