import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  loadPublicStandCatalog,
  loadPublicStandMeta,
} from "@/lib/public-stand-catalog";
import PaymentIconRow from "@/components/PaymentIconRow";
import { isDemoStandSlug } from "@/lib/demo";
import { mapPublicProduct } from "@/lib/public-product";
import { publicStandBranding } from "@/lib/public-stand-branding";
import { standAccentStyle } from "@/lib/stand-brand";
import { standPaymentBrands } from "@/lib/stand-payment-brands";
import { standSocialFromStand } from "@/lib/stand-social";
import { catalogMetadata, standCatalogPath } from "@/lib/stand-seo";
import StandCatalogGrid from "./StandCatalogGrid";
import StandGoToCartBar from "./StandGoToCartBar";
import StandSocialLinks from "./StandSocialLinks";
import StandStoreHeader from "./StandStoreHeader";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ standSlug: string }>;
}): Promise<Metadata> {
  const { standSlug } = await params;
  const slug = decodeURIComponent(standSlug).trim().toLowerCase();
  const stand = await loadPublicStandMeta(slug);
  if (!stand || !stand.isActive) return { title: "Stand" };
  return catalogMetadata({
    standName: stand.name,
    standSlug: stand.slug,
    locationLabel: stand.locationLabel,
    logoUrl: stand.logoUrl,
  });
}

export default async function PublicStandPage({
  params,
}: {
  params: Promise<{ standSlug: string }>;
}) {
  const { standSlug } = await params;
  const slug = decodeURIComponent(standSlug).trim().toLowerCase();
  const stand = await loadPublicStandCatalog(slug, "catalog");

  if (!stand || !stand.isActive) notFound();

  if (stand.cartMode === "CUSTOMER_CHOICE") {
    redirect(`${standCatalogPath(stand.slug)}/pay`);
  }

  const isDemo = isDemoStandSlug(stand.slug);

  const products = stand.products.map((p) =>
    mapPublicProduct(p, {
      showExactStock: stand.showExactStock,
      showPublicScarcity: stand.showPublicScarcity,
    }),
  );

  const branded = publicStandBranding(stand, stand.owner);
  const paymentBrands = standPaymentBrands(stand, {
    ...stand.owner,
    user: stand.owner.user,
  });
  const social = standSocialFromStand(branded);
  const hasSocial = Boolean(
    social.instagramUrl ||
      social.facebookUrl ||
      social.tiktokUrl ||
      social.youtubeUrl ||
      social.websiteUrl,
  );

  return (
    <main
      className="mx-auto min-h-full w-full max-w-lg px-4 pb-28 pt-8"
      style={standAccentStyle(branded.accentColor, branded.secondaryColor)}
    >
      {isDemo ? (
        <p className="mb-4 text-sm">
          <Link href="/" className="font-medium text-[var(--leaf-dark)] underline">
            ← Back to home
          </Link>
        </p>
      ) : null}
      <StandStoreHeader
        standName={stand.name}
        standSlug={stand.slug}
        logoUrl={branded.logoUrl}
        locationLabel={stand.locationLabel}
      />
      {products.length === 0 ? (
        <p className="mt-10 text-center text-xl text-[var(--muted)]">
          Nothing for sale right now.
        </p>
      ) : (
        <>
          <p className="mt-4 text-center text-lg text-[var(--muted)]">
            Choose items to purchase.
          </p>
          {paymentBrands.length > 0 ? (
            <div className="mt-2 flex justify-center">
              <PaymentIconRow brands={paymentBrands} className="w-full justify-center gap-2" />
            </div>
          ) : null}
          <StandCatalogGrid
            standSlug={stand.slug}
            currency={stand.currency}
            products={products}
          />
        </>
      )}
      {hasSocial ? (
        <footer className="mt-10 border-t border-[var(--line)] pt-6">
          <StandSocialLinks urls={social} standName={stand.name} className="mt-0" />
        </footer>
      ) : null}
      <StandGoToCartBar standSlug={stand.slug} />
    </main>
  );
}
