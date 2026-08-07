import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { localTransferForCurrency } from "@/lib/local-transfer";
import { standOffersCard, standOffersPayPal } from "@/lib/stand-payment-brands";
import { demoRegionForStandSlug, isDemoStandSlug } from "@/lib/demo";
import { isRestockAlertsEnabled } from "@/lib/restock-alerts";
import { mapPublicProduct } from "@/lib/public-product";
import { publicStandBranding } from "@/lib/public-stand-branding";
import { standAccentStyle } from "@/lib/stand-brand";
import { standCatalogPath } from "@/lib/stand-seo";
import { productLiveWhere } from "@/lib/product-visibility";
import {
  ownerPassesFeeToCustomer,
  shouldChargeVendlFee,
} from "@/lib/stallside-fee";
import StandCartCheckout from "../StandCartCheckout";
import StandStoreHeader from "../StandStoreHeader";

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
  const stand = await prisma.stand.findUnique({
    where: { slug },
    include: {
      products: {
        where: productLiveWhere,
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        include: {
          optionGroups: {
            orderBy: { sortOrder: "asc" },
            include: { choices: { orderBy: { sortOrder: "asc" } } },
          },
        },
      },
      owner: { include: { user: { select: { email: true, role: true } } } },
    },
  });
  if (!stand || !stand.isActive) notFound();

  const demoRegion = isDemoStandSlug(stand.slug)
    ? demoRegionForStandSlug(stand.slug)
    : null;
  const isDemo = Boolean(demoRegion);

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
    mapPublicProduct(p, { showExactStock: stand.showExactStock }),
  );

  const branded = publicStandBranding(stand, stand.owner);
  const restockStandId =
    !isDemo && isRestockAlertsEnabled() ? stand.id : null;

  return (
    <main
      className="mx-auto min-h-full w-full max-w-lg px-4 pb-8 pt-8"
      style={standAccentStyle(branded.accentColor, branded.secondaryColor)}
    >
      <StandStoreHeader
        standName={stand.name}
        standSlug={stand.slug}
        logoUrl={branded.logoUrl}
        backHref={standCatalogPath(stand.slug)}
        backLabel="← Continue shopping"
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
        demoRegion={demoRegion}
        restockStandId={restockStandId}
        passFeeToCustomer={ownerPassesFeeToCustomer(stand.owner)}
        stallsideFeeApplies={shouldChargeVendlFee(stand.owner)}
      />
    </main>
  );
}
