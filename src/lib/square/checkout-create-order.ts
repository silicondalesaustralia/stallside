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
import { computeVendlCheckoutFees } from "@/lib/stallside-fee";
import { isSquarePaymentsEnabled, squareApplicationId } from "@/lib/square/config";
import { getSquareConnection } from "@/lib/square/connection";
import { saleOriginIncursVendlFee } from "@/lib/commerce/sale-origin";
import { squareEligibleBillingCurrency } from "@/lib/commerce/payment-rail";

export type SquareCheckoutCartInput = {
  standSlug: string;
  items?: CartItemInput[];
  customerChoiceAmountCents?: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  couponCode?: string | null;
};

export async function createPendingSquareOrder(input: SquareCheckoutCartInput) {
  if (!isSquarePaymentsEnabled()) {
    return { error: "Square payments are not enabled." };
  }
  const applicationId = squareApplicationId();
  if (!applicationId) return { error: "Square is not configured." };

  const amount = input.customerChoiceAmountCents;
  const loaded =
    amount != null
      ? await loadCustomerChoiceCheckout(input.standSlug, amount)
      : await loadStandCart(input.standSlug, input.items ?? [], {
          receiptEmail:
            (input.customerEmail ?? "").trim().toLowerCase() || null,
          claimFirstOrder: Boolean(input.customerEmail && !input.couponCode),
          couponCode: input.couponCode ?? null,
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
  if (!stand.acceptSquare) {
    return { error: "This stand is not accepting card payments." };
  }
  if (!squareEligibleBillingCurrency(stand.owner.billingCurrency)) {
    return { error: "Square checkout is only available for Australian sellers." };
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
    applicationId,
    locationId: conn.primaryLocationId,
    amountCents: chargeTotalCents,
    currency: stand.currency,
    appFeeCents: platformFeeCents,
  };
}
