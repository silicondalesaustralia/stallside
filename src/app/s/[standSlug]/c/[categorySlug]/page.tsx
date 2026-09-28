import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import {
  loadPublicStandCatalog,
  loadPublicStandMeta,
} from "@/lib/public-stand-catalog";
import { loadStandShopCategories } from "@/lib/categories/public-categories";
import { mapPublicProduct } from "@/lib/public-product";
import { publicStandBranding } from "@/lib/public-stand-branding";
import { standAccentStyle } from "@/lib/stand-brand";
import { catalogMetadata, standCatalogPath } from "@/lib/stand-seo";
import StandCatalogGrid from "../../StandCatalogGrid";
import StandGoToCartBar from "../../StandGoToCartBar";
import StandStoreHeader from "../../StandStoreHeader";

type Params = Promise<{ standSlug: string; categorySlug: string }>;

function normalise(value: string) {
  return decodeURIComponent(value).trim().toLowerCase();
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { standSlug, categorySlug } = await params;
  const slug = normalise(standSlug);
  const [stand, categories] = await Promise.all([
    loadPublicStandMeta(slug),
    loadStandShopCategories(slug),
  ]);
  if (!stand || !stand.isActive) return { title: "Stand" };
  const category = categories.find((c) => c.slug === normalise(categorySlug));
  const base = catalogMetadata({
    standName: stand.name,
    standSlug: stand.slug,
    locationLabel: stand.locationLabel,
    logoUrl: stand.logoUrl,
    ogImageUrl: stand.ogImageUrl,
  });
  return category ? { ...base, title: `${category.title} · ${stand.name}` } : base;
}

export default async function StandCategoryPage({ params }: { params: Params }) {
  const { standSlug, categorySlug } = await params;
  const slug = normalise(standSlug);
  const [stand, categories] = await Promise.all([
    loadPublicStandCatalog(slug, "catalog"),
    loadStandShopCategories(slug),
  ]);
  if (!stand || !stand.isActive) notFound();
  if (stand.cartMode === "CUSTOMER_CHOICE") {
    redirect(`${standCatalogPath(stand.slug)}/pay`);
  }

  const category = categories.find((c) => c.slug === normalise(categorySlug));
  if (!category) notFound();

  const byId = new Map(stand.products.map((p) => [p.id, p]));
  const products = category.productIds.flatMap((id) => {
    const p = byId.get(id);
    return p
      ? [
          mapPublicProduct(p, {
            showExactStock: stand.showExactStock,
            showPublicScarcity: stand.showPublicScarcity,
            timeZone: stand.timezone,
          }),
        ]
      : [];
  });
  const branded = publicStandBranding(stand, stand.owner);

  return (
    <main
      className="mx-auto min-h-full w-full max-w-lg px-4 pb-28 pt-8"
      style={standAccentStyle(branded.accentColor, branded.secondaryColor)}
    >
      <StandStoreHeader
        standName={stand.name}
        standSlug={stand.slug}
        logoUrl={branded.logoUrl}
        locationLabel={stand.locationLabel}
        backHref={standCatalogPath(stand.slug)}
        backLabel="← All products"
      />
      <h2 className="mt-6 text-center font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
        {category.title}
      </h2>
      {category.description ? (
        <p className="mt-1 text-center text-[var(--muted)]">{category.description}</p>
      ) : null}
      {products.length === 0 ? (
        <p className="mt-10 text-center text-xl text-[var(--muted)]">Nothing here right now.</p>
      ) : (
        <StandCatalogGrid standSlug={stand.slug} currency={stand.currency} products={products} />
      )}
      <StandGoToCartBar standSlug={stand.slug} />
    </main>
  );
}
