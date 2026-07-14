"use server";

import { prisma } from "@/lib/prisma";
import {
  InventorySource,
  PaymentMethod,
  PaymentStatus,
  ReceiptChannel,
} from "@/generated/prisma/client";
import {
  decrementStockForOrder,
  loadStandCart,
  type CartItemInput,
} from "@/lib/checkout";
import { notifySale } from "@/lib/notify";
import { notifyTapAndGoInterest } from "@/lib/notify-tap-and-go";

export async function confirmCashCheckout(input: {
  standSlug: string;
  items: CartItemInput[];
}) {
  try {
    const loaded = await loadStandCart(input.standSlug, input.items);
    if ("error" in loaded) return { error: loaded.error };

    const { stand, byId, items, lineData, totalCents } = loaded;
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
            subtotalCents: totalCents,
            totalCents,
            currency: stand.currency,
            platformFeeCents: 0,
            receiptChannel: ReceiptChannel.NONE,
            items: { create: lineData },
          },
        });

        await decrementStockForOrder(tx, {
          items,
          byId,
          ownerId: stand.ownerId,
          standId: stand.id,
          orderId: created.id,
          source: InventorySource.ORDER_CASH,
          reason: "Cash sale",
        });

        return created;
      },
      { maxWait: 10_000, timeout: 30_000 },
    );

    try {
      await notifySale(order.id);
    } catch (error) {
      console.error("Sale notify failed", error);
    }

    return { orderNumber: order.orderNumber };
  } catch (error) {
    if (error instanceof Error && error.message === "STOCK") {
      return { error: "Stock changed - refresh and try again." };
    }
    console.error("Cash checkout failed", error);
    const detail =
      error instanceof Error
        ? error.message
        : "Could not complete cash checkout.";
    if (/timed out|timeout|P2028|can't reach|P1001/i.test(detail)) {
      return {
        error:
          "Checkout timed out talking to the database. Check DATABASE_URL / connection and try again.",
      };
    }
    return { error: `Could not complete cash checkout. (${detail})` };
  }
}

export async function requestTapAndGoInterest(standSlug: string) {
  try {
    return await notifyTapAndGoInterest(standSlug.trim().toLowerCase());
  } catch (error) {
    console.error("Tap & Go interest notify failed", error);
    return { error: "Could not notify the stand owner. Please try again." };
  }
}
