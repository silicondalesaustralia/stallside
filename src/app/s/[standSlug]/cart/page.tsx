import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { loadPublicStandCatalog } from "@/lib/public-stand-catalog";
import { prisma } from "@/lib/prisma";
import { localTransferForCurrency } from "@/lib/local-transfer";
import { standOffersCard, standOffersPayPal } from "@/lib/stand-payment-brands";
import { demoProductForStandSlug, isDemoStandSlug } from "@/lib/demo";
import { isRestockAlertsEnabled } from "@/lib/restock-alerts";
import { mapPublicProduct } from "@/lib/public-product";
import { publicStandBranding } from "@/lib/public-stand-branding";
import { standAccentStyle } from "@/lib/stand-brand";
import { standCatalogPath } from "@/lib/stand-seo";
import { readShopOriginFromCookies, readShopReturnModeFromCookies } from "@/lib/storefront/shop-origin";
import { readShopFulfilmentOptionFromCookies } from "@/lib/fulfilment/shop-option";
import { FulfilmentOptionKind } from "@/generated/prisma/client";
import { storefrontReturnShopUrl } from "@/lib/tenancy/public-url";
import {
  ownerPassesFeeToCustomer,
  shouldChargeVendlFee,
} from "@/lib/stallside-fee";
import StandCartCheckout from "../StandCartCheckout";
import StandStoreHeader from "../StandStoreHeader";
import { resolveAddonPricing } from "@/lib/preorder-upsell-pricing";

export const metadata: Metadata = {
  title: "Cart",
  robots: { index: false, follow: false },
};

export default async function StandCartPage({
  params,
}: {
  params: Promise<{ standSlug: string }>;
}) {
  const { standSlug } = await params;
  const slug = decodeURIComponent(standSlug).trim().toLowerCase();
  const stand = await loadPublicStandCatalog(slug, "cart");
  if (!stand || !stand.isActive) notFound();
  if (stand.cartMode === "CUSTOMER_CHOICE") {
    redirect(`${standCatalogPath(stand.slug)}/pay`);
  }

  const demoProduct = isDemoStandSlug(stand.slug)
    ? demoProductForStandSlug(stand.slug)
    : null;
  const isDemo = Boolean(demoProduct);

  const method = localTransferForCurrency(stand.currency);
  const alias = stand.localTransferAlias?.trim() ?? "";
  const localTransfer =
    stand.acceptLocalTransfer &&
    method &&
    alias &&
    stand.localTransferMethodId === method.id
      ? {
          methodId: method.id,
          buttonLabel: method.buttonLabel,
          aliasLabel: method.checkoutAliasLabel,
          alias,
        }
      : null;

  const products = stand.products.map((p) =>
    mapPublicProduct(p, {
      showExactStock: stand.showExactStock,
      showPublicScarcity: stand.showPublicScarcity,
      timeZone: stand.timezone,
    }),
  );

  const branded = publicStandBranding(stand, stand.owner);
  const restockStandId =
    !isDemo && isRestockAlertsEnabled() ? stand.id : null;

  const upsellProduct = stand.upsellProductId
    ? stand.products.find((p) => p.id === stand.upsellProductId)
    : null;
  const upsell =
    upsellProduct && upsellProduct.stockQuantity > 0
      ? {
          productId: upsellProduct.id,
          name: upsellProduct.name,
          priceCents:
            stand.upsellPriceCents != null
              ? stand.upsellPriceCents
              : upsellProduct.priceCents,
          stockQuantity: upsellProduct.stockQuantity,
        }
      : null;

  const preOrderUpsellProduct = stand.preOrderUpsellProductId
    ? stand.products.find((p) => p.id === stand.preOrderUpsellProductId)
    : null;
  const preOrderUpsell =
    stand.preOrderUpsellName &&
    preOrderUpsellProduct &&
    preOrderUpsellProduct.stockQuantity > 0
      ? (() => {
          const list =
            stand.preOrderUpsellPriceCents != null
              ? stand.preOrderUpsellPriceCents
              : preOrderUpsellProduct.priceCents;
          const priced = resolveAddonPricing(
            list,
            stand.preOrderUpsellDiscountKind,
            stand.preOrderUpsellDiscountValue,
          );
          return {
            productId: preOrderUpsellProduct.id,
            name: stand.preOrderUpsellName,
            priceCents: priced.saleCents,
            compareAtCents: priced.compareAtCents,
            stockQuantity: preOrderUpsellProduct.stockQuantity,
          };
        })()
      : null;

  const preOrderPages = await prisma.preOrderPage.findMany({
    where: {
      standId: stand.id,
      isActive: true,
      preOrderUpsellProductId: { not: null },
      preOrderUpsellName: { not: null },
    },
    select: {
      preOrderUpsellName: true,
      preOrderUpsellPriceCents: true,
      preOrderUpsellDiscountKind: true,
      preOrderUpsellDiscountValue: true,
      preOrderUpsellProductId: true,
      items: { select: { productId: true } },
    },
  });
  const pagePreOrderUpsells = preOrderPages
    .map((page) => {
      const offerProduct = stand.products.find(
        (p) => p.id === page.preOrderUpsellProductId,
      );
      if (
        !page.preOrderUpsellName ||
        !offerProduct ||
        offerProduct.stockQuantity <= 0
      ) {
        return null;
      }
      const list =
        page.preOrderUpsellPriceCents != null
          ? page.preOrderUpsellPriceCents
          : offerProduct.priceCents;
      const priced = resolveAddonPricing(
        list,
        page.preOrderUpsellDiscountKind,
        page.preOrderUpsellDiscountValue,
      );
      return {
        productId: offerProduct.id,
        name: page.preOrderUpsellName,
        priceCents: priced.saleCents,
        compareAtCents: priced.compareAtCents,
        stockQuantity: offerProduct.stockQuantity,
        pageProductIds: page.items.map((i) => i.productId),
      };
    })
    .filter((o): o is NonNullable<typeof o> => Boolean(o));

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const shopOriginSlug = readShopOriginFromCookies(cookieHeader);
  const shopReturnMode = readShopReturnModeFromCookies(cookieHeader);
  let backHref = standCatalogPath(stand.slug);
  let backLabel = "← Continue shopping";
  if (shopOriginSlug) {
    const originStorefront = await prisma.storefront.findFirst({
      where: { slug: shopOriginSlug, ownerId: stand.ownerId },
      select: { slug: true },
    });
    if (originStorefront) {
      backHref = storefrontReturnShopUrl(
        originStorefront.slug,
        shopReturnMode,
      );
      backLabel = "← Back to shop";
    }
  }

  let shopDeliveryRequired = false;
  let shopDeliveryFeeCents = 0;
  let shopFulfilmentLabel: string | null = null;
  const shopOptionId = readShopFulfilmentOptionFromCookies(cookieHeader);
  if (shopOptionId) {
    const shopOption = await prisma.fulfilmentOption.findFirst({
      where: {
        id: shopOptionId,
        ownerId: stand.ownerId,
        isActive: true,
        channels: { has: "ONLINE" },
      },
      include: {
        deliveryZone: { select: { deliveryFeeCents: true } },
      },
    });
    if (shopOption) {
      shopFulfilmentLabel = shopOption.label;
      if (shopOption.kind === FulfilmentOptionKind.DELIVERY) {
        shopDeliveryRequired = true;
        shopDeliveryFeeCents =
          shopOption.feeCents || shopOption.deliveryZone?.deliveryFeeCents || 0;
      }
    }
  }

  return (
    <main
      className="mx-auto min-h-full w-full max-w-lg px-4 pb-8 pt-8"
      style={standAccentStyle(branded.accentColor, branded.secondaryColor)}
    >
      <StandStoreHeader
        standName={stand.name}
        standSlug={stand.slug}
        logoUrl={branded.logoUrl}
        backHref={backHref}
        backLabel={backLabel}
      />
      <h2 className="mt-6 font-[family-name:var(--font-display)] text-2xl font-bold">
        Your cart
      </h2>
      <StandCartCheckout
        standSlug={stand.slug}
        currency={stand.currency}
        products={products}
        cashEnabled={stand.acceptCash}
        cardEnabled={standOffersCard(stand, {
          ...stand.owner,
          user: stand.owner.user,
        })}
        paypalEnabled={standOffersPayPal(stand, {
          ...stand.owner,
          user: stand.owner.user,
        })}
        paypalClientId={process.env.PAYPAL_CLIENT_ID ?? null}
        paypalMerchantId={stand.owner.paypalMerchantId}
        paypalSandbox={
          (process.env.PAYPAL_MODE || "sandbox").toLowerCase() !== "live"
        }
        localTransfer={localTransfer}
        demoProduct={demoProduct}
        restockStandId={restockStandId}
        passFeeToCustomer={ownerPassesFeeToCustomer(stand.owner)}
        stallsideFeeApplies={shouldChargeVendlFee(stand.owner)}
        upsell={upsell}
        preOrderUpsell={preOrderUpsell}
        pagePreOrderUpsells={pagePreOrderUpsells}
        firstOrder={
          stand.firstOrderDiscountEnabled
            ? {
                enabled: true,
                percent: stand.firstOrderDiscountPercent,
                amountCents: stand.firstOrderDiscountAmountCents,
              }
            : null
        }
        shopDeliveryRequired={shopDeliveryRequired}
        shopDeliveryFeeCents={shopDeliveryFeeCents}
        shopFulfilmentLabel={shopFulfilmentLabel}
      />
    </main>
  );
}
