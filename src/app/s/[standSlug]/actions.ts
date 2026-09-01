"use server";

import { prisma } from "@/lib/prisma";
import {
  HandoverMode,
  InventorySource,
  PaymentMethod,
  PaymentStatus,
  ReceiptChannel,
} from "@/generated/prisma/client";
import {
  decrementStockForOrder,
  loadCustomerChoiceCheckout,
  loadStandCart,
  orderItemCreates,
  type CartItemInput,
} from "@/lib/checkout";
import { after } from "next/server";
import { normalizeReceiptEmail } from "@/lib/first-order-discount";
import { notifySale } from "@/lib/notify";
import { notifyTapAndGoInterest } from "@/lib/notify-tap-and-go";
import { localTransferForCurrency } from "@/lib/local-transfer";

type CheckoutExtras = {
  receiptEmail?: string | null;
  claimFirstOrder?: boolean;
};

type CheckoutPayload = {
  standSlug: string;
  items?: CartItemInput[];
  /** Open-amount total for Customer Choice cart (cents). */
  customerChoiceAmountCents?: number;
} & CheckoutExtras;

async function loadCheckoutCart(input: CheckoutPayload) {
  const amount = input.customerChoiceAmountCents;
  if (amount != null) {
    if (input.items?.length) {
      return { error: "Invalid checkout payload." as const };
    }
    return loadCustomerChoiceCheckout(input.standSlug, amount);
  }
  return loadStandCart(input.standSlug, input.items ?? [], {
    receiptEmail: input.receiptEmail,
    claimFirstOrder: input.claimFirstOrder,
  });
}

export async function confirmCashCheckout(input: CheckoutPayload) {
  return confirmDeclaredCheckout({
    ...input,
    paymentMethod: PaymentMethod.CASH,
    inventorySource: InventorySource.ORDER_CASH,
    reason: "Cash sale",
  });
}

export async function confirmLocalTransferCheckout(input: CheckoutPayload) {
  const loaded = await loadCheckoutCart(input);
  if ("error" in loaded) return { error: loaded.error };

  const method = localTransferForCurrency(loaded.stand.currency);
  const alias = loaded.stand.localTransferAlias?.trim();
  if (
    !loaded.stand.acceptLocalTransfer ||
    !method ||
    !alias ||
    loaded.stand.localTransferMethodId !== method.id
  ) {
    return { error: "Local transfer is not available at this stand." };
  }

  return confirmDeclaredCheckout({
    ...input,
    paymentMethod: PaymentMethod.LOCAL_TRANSFER,
    inventorySource: InventorySource.ORDER_LOCAL_TRANSFER,
    reason: `${method.buttonLabel} sale`,
    localTransferMethodId: method.id,
  });
}

async function confirmDeclaredCheckout(
  input: CheckoutPayload & {
    paymentMethod: typeof PaymentMethod.CASH | typeof PaymentMethod.LOCAL_TRANSFER;
    inventorySource:
      | typeof InventorySource.ORDER_CASH
      | typeof InventorySource.ORDER_LOCAL_TRANSFER;
    reason: string;
    localTransferMethodId?: string;
  },
) {
  try {
    const email = input.receiptEmail
      ? normalizeReceiptEmail(input.receiptEmail)
      : "";
    const loaded = await loadCheckoutCart({
      ...input,
      receiptEmail: email || null,
      claimFirstOrder: Boolean(input.claimFirstOrder && email),
    });
    if ("error" in loaded) return { error: loaded.error };

    const {
      stand,
      byId,
      items,
      lineData,
      subtotalCents,
      discountCents,
      discountLabel,
      totalCents,
      preOrderCart,
      skipStock,
    } = loaded;
    if (preOrderCart) {
      return { error: "Pre-orders must be paid by card." };
    }
    if (input.paymentMethod === PaymentMethod.CASH && !stand.acceptCash) {
      return { error: "Cash is not available at this stand." };
    }
    if (
      input.paymentMethod === PaymentMethod.LOCAL_TRANSFER &&
      !stand.acceptLocalTransfer
    ) {
      return { error: "Local transfer is not available at this stand." };
    }

    const orderNumber = `FS-${Date.now().toString(36).toUpperCase()}`;

    const order = await prisma.$transaction(
      async (tx) => {
        const created = await tx.order.create({
          data: {
            standId: stand.id,
            ownerId: stand.ownerId,
            orderNumber,
            paymentMethod: input.paymentMethod,
            paymentStatus: PaymentStatus.CUSTOMER_CONFIRMED,
            localTransferMethodId: input.localTransferMethodId ?? null,
            subtotalCents,
            discountCents,
            discountLabel,
            totalCents,
            currency: stand.currency,
            platformFeeCents: 0,
            receiptChannel: email ? ReceiptChannel.EMAIL : ReceiptChannel.NONE,
            receiptEmail: email || null,
            items: { create: orderItemCreates(lineData) },
          },
        });

        if (!skipStock) {
          await decrementStockForOrder(tx, {
            items,
            byId,
            ownerId: stand.ownerId,
            standId: stand.id,
            orderId: created.id,
            source: input.inventorySource,
            reason: input.reason,
          });
        }

        return created;
      },
      { maxWait: 10_000, timeout: 30_000 },
    );

    try {
      const { ensureCustomer } = await import("@/lib/catalogue/customers");
      const customer = await ensureCustomer({
        ownerId: stand.ownerId,
        email,
        source: "order",
      });
      if (customer) {
        await prisma.order.update({
          where: { id: order.id },
          data: { customerId: customer.id },
        });
      }
    } catch (err) {
      console.error("Customer link failed", err);
    }

    try {
      const { snapshotOrderFulfilment } = await import(
        "@/lib/fulfilment/snapshot-order"
      );
      await snapshotOrderFulfilment({
        orderId: order.id,
        standId: stand.id,
        ownerId: stand.ownerId,
        isPreOrder: false,
        handoverMode: HandoverMode.COLLECT,
      });
    } catch (err) {
      console.error("Order fulfilment snapshot failed", err);
    }

    after(() => {
      void notifySale(order.id).catch((error) => {
        console.error("Sale notify failed", error);
      });
    });

    return { orderNumber: order.orderNumber };
  } catch (error) {
    if (error instanceof Error && error.message === "STOCK") {
      return { error: "Stock changed - refresh and try again." };
    }
    console.error("Declared checkout failed", error);
    const detail =
      error instanceof Error
        ? error.message
        : "Could not complete checkout.";
    if (/timed out|timeout|P2028|can't reach|P1001/i.test(detail)) {
      return {
        error:
          "Checkout timed out talking to the database. Check DATABASE_URL / connection and try again.",
      };
    }
    return { error: `Could not complete checkout. (${detail})` };
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
