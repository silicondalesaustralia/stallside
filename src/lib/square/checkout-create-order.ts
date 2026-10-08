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
import {
  SQUARE_CURRENCY,
  squareEligibleBillingCurrency,
} from "@/lib/commerce/payment-rail";
import { cleanShopperDetails, planSquarePreOrder } from "@/lib/square/checkout-preorder";
export type SquareCheckoutCartInput = {
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
  couponCode?: string | null;
};

export async function createPendingSquareOrder(input: SquareCheckoutCartInput) {
  if (!isSquarePaymentsEnabled()) {
    return { error: "Square payments are not enabled." };
  }
  const applicationId = squareApplicationId();
  if (!applicationId) return { error: "Square is not configured." };

  const shopper = cleanShopperDetails(input);
  const amount = input.customerChoiceAmountCents;
  const loaded =
    amount != null
      ? await loadCustomerChoiceCheckout(input.standSlug, amount)
      : await loadStandCart(input.standSlug, input.items ?? [], {
          receiptEmail: shopper.customerEmail || null,
          claimFirstOrder: Boolean(shopper.customerEmail),
        });
  if ("error" in loaded) return { error: loaded.error };

  const { stand, lineData, subtotalCents, discountCents, discountLabel, totalCents, preOrderCart } =
    loaded;
  if (!stand.acceptSquare) {
    return { error: "This shop is not accepting card payments." };
  }
  if (
    !squareEligibleBillingCurrency(stand.owner.billingCurrency) ||
    stand.currency.trim().toUpperCase() !== SQUARE_CURRENCY
  ) {
    return { error: "Square checkout is only available for Australian (AUD) businesses." };
  }

  const conn = await getSquareConnection(stand.ownerId);
  if (!conn || conn.status !== "ACTIVE" || !conn.paymentsEnabled || !conn.primaryLocationId) {
    return { error: "Seller Square connection is not ready." };
  }
  if (stand.owner.onlinePaymentProvider !== OnlinePaymentProvider.SQUARE) {
    return { error: "Seller is not using Square for online payments." };
  }

  const plan = preOrderCart
    ? await planSquarePreOrder({
        preOrderCart,
        shopper,
        totalCents,
        ownerId: stand.ownerId,
        grantedScopes: conn.scopes,
      })
    : null;
  if (plan && "error" in plan) return { error: plan.error };

  const { applicationFeeCents, chargeTotalCents, passedOn } = computeVendlCheckoutFees(
    plan?.chargeGoodsCents ?? totalCents,
    stand.owner,
    { rail: "square", currency: stand.currency },
  );
  const saleOrigin = SaleOrigin.VENDL_WEB;
  const platformFeeCents = saleOriginIncursVendlFee(saleOrigin) ? applicationFeeCents : 0;
  const deposit = plan?.deposit ?? null;

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
      totalCents: deposit ? totalCents + (passedOn ? applicationFeeCents : 0) : chargeTotalCents,
      discountCents,
      discountLabel,
      currency: stand.currency,
      platformFeeCents,
      squareLocationId: conn.primaryLocationId,
      receiptEmail: shopper.customerEmail || null,
      receiptChannel: shopper.customerEmail ? ReceiptChannel.EMAIL : ReceiptChannel.NONE,
      customerName: shopper.customerName || null,
      customerPhone: shopper.customerPhone,
      isPreOrder: Boolean(preOrderCart),
      collectionAt: preOrderCart?.collectionAt ?? null,
      collectionNote: preOrderCart?.collectionNote ?? null,
      collectionStatus: preOrderCart ? CollectionStatus.ORDERED : null,
      paymentTiming: preOrderCart?.paymentTiming ?? PaymentTiming.PAY_NOW,
      handoverMode: preOrderCart?.handoverMode ?? HandoverMode.COLLECT,
      ...(deposit ?? {}),
      ...(plan?.delivery ?? {}),
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
    saveCard: Boolean(deposit),
  };
}
