import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { isReservedProductSlug } from "@/lib/slug";
import { formatMoney, mapPublicProduct } from "@/lib/public-product";
import { publicStandBranding } from "@/lib/public-stand-branding";
import { standAccentStyle } from "@/lib/stand-brand";
import { productMetadata, standCatalogPath } from "@/lib/stand-seo";
import { productLiveWhere } from "@/lib/product-visibility";
import ProductDetailActions from "../ProductDetailActions";
import StandStoreHeader from "../StandStoreHeader";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ standSlug: string; productSlug: string }>;
}): Promise<Metadata> {
  const { standSlug, productSlug } = await params;
  const standKey = decodeURIComponent(standSlug).trim().toLowerCase();
  const productKey = decodeURIComponent(productSlug).trim().toLowerCase();
  if (isReservedProductSlug(productKey)) return { title: "Product" };

  const stand = await prisma.stand.findUnique({
    where: { slug: standKey },
    include: {
      products: {
        where: { slug: productKey, ...productLiveWhere },
        take: 1,
      },
    },
  });
  const product = stand?.products[0];
  if (!stand || !stand.isActive || !product) return { title: "Product" };

  return productMetadata({
    standName: stand.name,
    standSlug: stand.slug,
    productName: product.name,
    productSlug: product.slug,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    description: product.description,
    imageUrl: product.imageUrl,
    isPreOrder: product.isPreOrder,
    collectionNote: product.collectionNote,
  });
}

export default async function PublicProductPage({
  params,
}: {
  params: Promise<{ standSlug: string; productSlug: string }>;
}) {
  const { standSlug, productSlug } = await params;
  const standKey = decodeURIComponent(standSlug).trim().toLowerCase();
  const productKey = decodeURIComponent(productSlug).trim().toLowerCase();
  if (isReservedProductSlug(productKey)) notFound();

  const stand = await prisma.stand.findUnique({
    where: { slug: standKey },
    include: {
      owner: { include: { user: { select: { email: true, role: true } } } },
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
    },
  });
  if (!stand || !stand.isActive) notFound();

  const productRow = stand.products.find((p) => p.slug === productKey);
  if (!productRow) notFound();

  const branded = publicStandBranding(stand, stand.owner);
  const catalogProducts = stand.products
    .filter((p) => !p.isHidden)
    .map((p) =>
      mapPublicProduct(p, {
        showExactStock: stand.showExactStock,
        showPublicScarcity: stand.showPublicScarcity,
      }),
    );
  const product = mapPublicProduct(productRow, {
    showExactStock: stand.showExactStock,
    showPublicScarcity: stand.showPublicScarcity,
  });

  return (
    <main
      className="mx-auto min-h-full w-full max-w-lg px-4 pb-10 pt-8"
      style={standAccentStyle(branded.accentColor, branded.secondaryColor)}
    >
      <StandStoreHeader
        standName={stand.name}
        standSlug={stand.slug}
        logoUrl={branded.logoUrl}
        backHref={standCatalogPath(stand.slug)}
        backLabel="← All products"
      />
      <article className="mt-6">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt=""
            className="aspect-square w-full rounded-[var(--radius)] object-cover"
          />
        ) : null}
        <h2 className="mt-6 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
          {product.name}
        </h2>
        {product.isPreOrder ? (
          <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-[var(--leaf)]">
            Pre-order
          </p>
        ) : null}
        {product.description ? (
          <p className="mt-3 text-lg leading-snug text-[var(--muted)]">
            {product.description}
          </p>
        ) : null}
        {product.freshnessNote ? (
          <p className="mt-2 text-base text-[var(--leaf-dark)]">
            {product.freshnessNote}
          </p>
        ) : null}
        {product.priceTiers.length > 0 ? (
          <p className="mt-2 font-receipt text-sm text-[var(--muted)]">
            {product.priceTiers
              .map(
                (t) =>
                  `${t.qty} for ${formatMoney(t.totalCents, stand.currency)}`,
              )
              .join(" · ")}
          </p>
        ) : null}
        <ProductDetailActions
          standSlug={stand.slug}
          currency={stand.currency}
          product={product}
          catalogProducts={catalogProducts}
        />
      </article>
    </main>
  );
}
