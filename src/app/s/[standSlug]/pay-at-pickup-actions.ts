"use server";

import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  CollectionStatus,
  HandoverMode,
  InventorySource,
  PaymentMethod,
  PaymentStatus,
  PaymentTiming,
  ReceiptChannel,
} from "@/generated/prisma/client";
import { decrementStockForOrder, loadStandCart, type CartItemInput } from "@/lib/checkout";
import { orderLineFields } from "@/lib/order-gst";
import { notifySale } from "@/lib/notify";
import { notifyOrderCustomer } from "@/lib/notify-order-customer";
import { syncSaleToSquare } from "@/lib/square/sync-stock";
import { linkOrderToCustomer } from "@/lib/catalogue/customers";

/** Places a pre-order the buyer pays for in person at collection. Nothing is charged online. */
export async function placePayAtPickupOrder(input: {
  standSlug: string;
  items: CartItemInput[];
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}): Promise<{ orderNumber: string } | { error: string }> {
  try {
    const customerName = (input.customerName ?? "").trim().slice(0, 120);
    const customerEmail = (input.customerEmail ?? "").trim().toLowerCase().slice(0, 200);
    const customerPhone = (input.customerPhone ?? "").trim().slice(0, 40) || null;

    const loaded = await loadStandCart(input.standSlug, input.items, {
      receiptEmail: customerEmail || null,
      claimFirstOrder: Boolean(customerEmail),
      payTiming: "PAY_AT_PICKUP",
    });
    if ("error" in loaded) return { error: loaded.error ?? "Could not place your order." };

    const { stand, byId, items, lineData, preOrderCart } = loaded;
    if (preOrderCart?.paymentTiming !== PaymentTiming.PAY_AT_PICKUP) {
      return { error: "These items need to be paid for online." };
    }
    if (!customerName) return { error: "Enter your name for collection." };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return { error: "Enter a valid email for order details." };
    }

    const orderNumber = `FS-${Date.now().toString(36).toUpperCase()}`;
    const order = await prisma.$transaction(
      async (tx) => {
        const created = await tx.order.create({
          data: {
            standId: stand.id,
            ownerId: stand.ownerId,
            orderNumber,
            paymentMethod: PaymentMethod.CASH,
            paymentStatus: PaymentStatus.CUSTOMER_CONFIRMED,
            subtotalCents: loaded.subtotalCents,
            discountCents: loaded.discountCents,
            discountLabel: loaded.discountLabel,
            totalCents: loaded.totalCents,
            currency: stand.currency,
            platformFeeCents: 0,
            receiptChannel: ReceiptChannel.EMAIL,
            receiptEmail: customerEmail,
            ...orderLineFields(lineData, loaded.discountCents, stand),
            isPreOrder: true,
            collectionAt: preOrderCart.collectionAt,
            collectionNote: preOrderCart.collectionNote,
            collectionStatus: CollectionStatus.ORDERED,
            customerName,
            customerPhone,
            paymentTiming: PaymentTiming.PAY_AT_PICKUP,
            handoverMode: HandoverMode.COLLECT,
          },
        });
        await decrementStockForOrder(tx, {
          items,
          byId,
          ownerId: stand.ownerId,
          standId: stand.id,
          orderId: created.id,
          source: InventorySource.ORDER_CASH,
          reason: "Pre-order (pay at pickup)",
        });
        return created;
      },
      { maxWait: 10_000, timeout: 30_000 },
    );

    after(() =>
      Promise.allSettled([
        notifySale(order.id).catch((error) => console.error("Sale notify failed", error)),
        notifyOrderCustomer(order.id).catch((error) =>
          console.error("Customer order email failed", error),
        ),
        syncSaleToSquare({ ownerId: stand.ownerId, orderId: order.id, items }),
        linkOrderToCustomer({
          orderId: order.id,
          ownerId: stand.ownerId,
          email: customerEmail,
          name: customerName,
          phone: customerPhone,
        }).catch((error) => console.error("Link order to customer failed", error)),
      ]),
    );

    return { orderNumber: order.orderNumber };
  } catch (error) {
    if (error instanceof Error && error.message === "STOCK") {
      return { error: "Stock changed - refresh and try again." };
    }
    console.error("Pay at pickup order failed", error);
    return { error: "Could not place your order. Please try again." };
  }
}
