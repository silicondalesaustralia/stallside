import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { mapPublicProduct } from "@/lib/public-product";
import { publicStandBranding } from "@/lib/public-stand-branding";
import { standAccentStyle } from "@/lib/stand-brand";
import { standCatalogPath } from "@/lib/stand-seo";
import { productLiveWhere } from "@/lib/product-visibility";
import { SITE_URL } from "@/lib/legal";
import { preOrderPagePath } from "@/lib/preorder-page";
import { formatCollectionLabel } from "@/lib/pre-order";
import StandStoreHeader from "../../StandStoreHeader";
import StandGoToCartBar from "../../StandGoToCartBar";
import PreOrderPageOrder from "./PreOrderPageOrder";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ standSlug: string; pageSlug: string }>;
}): Promise<Metadata> {
  const { standSlug, pageSlug } = await params;
  const standKey = decodeURIComponent(standSlug).trim().toLowerCase();
  const pageKey = decodeURIComponent(pageSlug).trim().toLowerCase();
  const page = await prisma.preOrderPage.findFirst({
    where: {
      slug: pageKey,
      isActive: true,
      stand: { slug: standKey, isActive: true },
    },
    include: { stand: { select: { name: true, slug: true } } },
  });
  if (!page) return { title: "Pre-order" };
  const title = `${page.title} · ${page.stand.name}`;
  const description =
    page.description?.trim() ||
    `Pre-order for ${formatCollectionLabel(page.collectionAt)} from ${page.stand.name}.`;
  const canonical = `${SITE_URL}${preOrderPagePath(page.stand.slug, page.slug)}`;
  return {
    title,
    description,
    alternates: { canonical },
  };
}

export default async function PublicPreOrderPage({
  params,
}: {
  params: Promise<{ standSlug: string; pageSlug: string }>;
}) {
  const { standSlug, pageSlug } = await params;
  const standKey = decodeURIComponent(standSlug).trim().toLowerCase();
  const pageKey = decodeURIComponent(pageSlug).trim().toLowerCase();

  const stand = await prisma.stand.findUnique({
    where: { slug: standKey },
    include: {
      owner: true,
      products: {
        where: productLiveWhere,
        include: {
          optionGroups: {
            orderBy: { sortOrder: "asc" },
            include: { choices: { orderBy: { sortOrder: "asc" } } },
          },
        },
      },
    },
  });
  if (!stand || !stand.isActive) notFound();

  const page = await prisma.preOrderPage.findFirst({
    where: {
      standId: stand.id,
      slug: pageKey,
      isActive: true,
    },
    include: {
      items: {
        orderBy: { sortOrder: "asc" },
        include: { product: true },
      },
    },
  });
  if (!page) notFound();

  const branded = publicStandBranding(stand, stand.owner);
  const byId = new Map(
    stand.products.map((p) => [
      p.id,
      mapPublicProduct(p, {
        showExactStock: stand.showExactStock || page.showExactStock,
        showPublicScarcity: stand.showPublicScarcity,
      }),
    ]),
  );
  const pageProducts = page.items
    .map((i) => byId.get(i.productId))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const catalogProducts = [...byId.values()];

  if (pageProducts.length === 0) notFound();

  return (
    <main
      className="mx-auto min-h-full w-full max-w-lg px-4 pb-24 pt-8"
      style={standAccentStyle(branded.accentColor, branded.secondaryColor)}
    >
      <StandStoreHeader
        standName={stand.name}
        standSlug={stand.slug}
        logoUrl={branded.logoUrl}
        backHref={standCatalogPath(stand.slug)}
        backLabel="← All products"
      />
      <h1 className="mt-6 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
        {page.title}
      </h1>
      <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-[var(--leaf)]">
        Pre-order · {formatCollectionLabel(page.collectionAt)}
      </p>
      {page.description ? (
        <p className="mt-3 text-lg leading-snug text-[var(--muted)]">
          {page.description}
        </p>
      ) : null}

      <PreOrderPageOrder
        standSlug={stand.slug}
        currency={stand.currency}
        products={pageProducts}
        catalogProducts={catalogProducts}
      />
      <StandGoToCartBar standSlug={stand.slug} />
    </main>
  );
}
