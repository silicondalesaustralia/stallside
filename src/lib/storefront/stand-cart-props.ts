import type { ComponentProps } from "react";
import type StandCartCheckout from "@/app/s/[standSlug]/StandCartCheckout";
import { loadPublicStandCatalog } from "@/lib/public-stand-catalog";
import { localTransferForCurrency } from "@/lib/local-transfer";
import { standOffersCard, standOffersPayPal, standOffersSquare } from "@/lib/stand-payment-brands";
import { getSquareConnection } from "@/lib/square/connection";
import { isSquarePaymentsEnabled } from "@/lib/square/config";
import { squareConnectionMatchesBilling } from "@/lib/commerce/payment-rail";
import { demoProductForStandSlug, isDemoStandSlug } from "@/lib/demo";
import { isRestockAlertsEnabled } from "@/lib/restock-alerts";
import { mapPublicProduct } from "@/lib/public-product";
import { publicStandBranding } from "@/lib/public-stand-branding";
import { standShippingSettings } from "@/lib/shipping/shipping-cost";
import {
  ownerPassesFeeToCustomer,
  shouldChargeVendlFee,
} from "@/lib/stallside-fee";
import {
  standCartUpsell,
  standPagePreOrderUpsells,
  standPreOrderUpsell,
} from "./cart-upsell-offers";
import { loadUpsellRules, type UpsellChannel } from "@/lib/upsells/load-rules";
import { hasLiveDiscountCodes } from "@/lib/discounts/has-live-codes";
import { cartAddedTax } from "@/lib/tax/cart-tax";

export type StandCartCheckoutProps = Omit<ComponentProps<typeof StandCartCheckout>, "shopHref">;

export type StandCartData = {
  stand: {
    id: string;
    slug: string;
    name: string;
    cartMode: string;
    logoUrl: string | null;
    accentColor: string | null;
    secondaryColor: string | null;
  };
  props: StandCartCheckoutProps;
};

function localTransferFor(stand: {
  currency: string;
  acceptLocalTransfer: boolean;
  localTransferAlias: string | null;
  localTransferMethodId: string | null;
}) {
  const method = localTransferForCurrency(stand.currency);
  const alias = stand.localTransferAlias?.trim() ?? "";
  if (!stand.acceptLocalTransfer || !method || !alias) return null;
  if (stand.localTransferMethodId !== method.id) return null;
  return {
    methodId: method.id,
    buttonLabel: method.buttonLabel,
    aliasLabel: method.checkoutAliasLabel,
    alias,
  };
}

/** Everything the cart & checkout needs for an active stand; null when missing or inactive. */
export async function loadStandCartData(
  standSlug: string,
  channel: UpsellChannel = "stall",
): Promise<StandCartData | null> {
  const stand = await loadPublicStandCatalog(standSlug, "cart");
  if (!stand || !stand.isActive) return null;

  const demoProduct = isDemoStandSlug(stand.slug) ? demoProductForStandSlug(stand.slug) : null;
  const products = stand.products.map((p) =>
    mapPublicProduct(p, {
      showExactStock: stand.showExactStock,
      showPublicScarcity: stand.showPublicScarcity,
      timeZone: stand.timezone,
      fulfilmentDefault: stand.fulfilmentDefault,
    }),
  );
  const branded = publicStandBranding(stand, stand.owner);
  const squareConn = isSquarePaymentsEnabled() ? await getSquareConnection(stand.ownerId) : null;
  const ownerForPay = {
    ...stand.owner,
    user: stand.owner.user,
    squarePaymentsReady: Boolean(
      squareConn?.status === "ACTIVE" &&
        squareConn.paymentsEnabled &&
        squareConn.primaryLocationId &&
        squareConnectionMatchesBilling(squareConn, stand.owner.billingCurrency),
    ),
  };

  return {
    stand: {
      id: stand.id,
      slug: stand.slug,
      name: stand.name,
      cartMode: stand.cartMode,
      logoUrl: branded.logoUrl,
      accentColor: branded.accentColor,
      secondaryColor: branded.secondaryColor,
    },
    props: {
      standSlug: stand.slug,
      currency: stand.currency,
      products,
      cashEnabled: stand.acceptCash,
      cardEnabled: standOffersCard(stand, ownerForPay),
      squareEnabled: standOffersSquare(stand, ownerForPay),
      paypalEnabled: standOffersPayPal(stand, ownerForPay),
      paypalClientId: process.env.PAYPAL_CLIENT_ID ?? null,
      paypalMerchantId: stand.owner.paypalMerchantId,
      paypalSandbox: (process.env.PAYPAL_MODE || "sandbox").toLowerCase() !== "live",
      localTransfer: localTransferFor(stand),
      demoProduct,
      restockStandId: !demoProduct && isRestockAlertsEnabled() ? stand.id : null,
      passFeeToCustomer: ownerPassesFeeToCustomer(stand.owner, stand.currency),
      stallsideFeeApplies: shouldChargeVendlFee(stand.owner),
      shipping: standShippingSettings(stand),
      addedTax: cartAddedTax(stand),
      upsell: standCartUpsell(stand),
      preOrderUpsell: standPreOrderUpsell(stand),
      pagePreOrderUpsells: await standPagePreOrderUpsells(stand),
      upsellRules: await loadUpsellRules(stand.id, channel),
      discountChannel: (await hasLiveDiscountCodes(stand.ownerId, stand.id, channel))
        ? channel
        : null,
      firstOrder: stand.firstOrderDiscountEnabled
        ? {
            enabled: true,
            percent: stand.firstOrderDiscountPercent,
            amountCents: stand.firstOrderDiscountAmountCents,
          }
        : null,
    },
  };
}
