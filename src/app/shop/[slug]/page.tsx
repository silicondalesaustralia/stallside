import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  loadPublishedStorefront,
  storefrontPublicPath,
} from "@/lib/catalogue/storefront";
import { mapPublicProduct } from "@/lib/public-product";
import { publicStandBranding } from "@/lib/public-stand-branding";
import { standAccentStyle } from "@/lib/stand-brand";
import { standPaymentBrands } from "@/lib/stand-payment-brands";
import { standCatalogPath } from "@/lib/stand-seo";
import StandCatalogGrid from "@/app/s/[standSlug]/StandCatalogGrid";
import StandGoToCartBar from "@/app/s/[standSlug]/StandGoToCartBar";
import StandStoreHeader from "@/app/s/[standSlug]/StandStoreHeader";
import PaymentIconRow from "@/components/PaymentIconRow";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await loadPublishedStorefront(slug);
  if (!data) return { title: "Shop" };
  const title = data.storefront.headline || data.owner.businessName;
  return {
    title,
    description:
      data.storefront.about ||
      data.owner.shortDescription ||
      `Shop ${title} online`,
  };
}

export default async function PublicStorefrontPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await loadPublishedStorefront(slug);
  if (!data) notFound();

  const { storefront, stand, products, owner } = data;
  const branded = publicStandBranding(stand, owner);
  const paymentBrands = standPaymentBrands(stand, {
    ...owner,
    user: owner.user,
  });
  const catalogProducts = products.map((p) =>
    mapPublicProduct(p, {
      showExactStock: stand.showExactStock,
      showPublicScarcity: stand.showPublicScarcity,
      timeZone: stand.timezone,
    }),
  );

  return (
    <main
      className="mx-auto min-h-full w-full max-w-lg px-4 pb-28 pt-8"
      style={standAccentStyle(branded.accentColor, branded.secondaryColor)}
    >
      <StandStoreHeader
        standName={storefront.headline || owner.businessName}
        standSlug={stand.slug}
        logoUrl={branded.logoUrl}
        backHref={storefrontPublicPath(storefront.slug)}
        backLabel="Shop"
      />
      {storefront.about ? (
        <p className="mt-4 text-[var(--muted)]">{storefront.about}</p>
      ) : null}
      <p className="mt-2 text-xs text-[var(--muted)]">
        Checkout uses your{" "}
        <Link href={standCatalogPath(stand.slug)} className="underline">
          {stand.name}
        </Link>{" "}
        stand — QR links still work.
      </p>
      <PaymentIconRow brands={paymentBrands} className="mt-4" />
      <StandCatalogGrid
        standSlug={stand.slug}
        currency={stand.currency}
        products={catalogProducts}
      />
      <StandGoToCartBar standSlug={stand.slug} />
    </main>
  );
}
