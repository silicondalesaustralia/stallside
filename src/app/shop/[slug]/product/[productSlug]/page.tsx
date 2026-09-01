import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { resolveProductForStand } from "@/lib/catalogue/channels";
import { isReservedProductSlug } from "@/lib/slug";
import { formatMoney, mapPublicProduct } from "@/lib/public-product";
import { productLiveWhere } from "@/lib/product-visibility";
import { ProductChannelType } from "@/generated/prisma/client";
import { loadStorefrontPage, storefrontEnabledPages } from "@/lib/storefront/page-loader";
import { storefrontMetadata } from "@/lib/storefront/seo";
import { shopPagePath } from "@/lib/storefront/paths";
import StorefrontShell from "@/components/storefront/StorefrontShell";
import StorefrontGoToCartBar from "@/components/storefront/StorefrontGoToCartBar";
import ProductDetailActions from "@/app/s/[standSlug]/ProductDetailActions";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; productSlug: string }>;
  searchParams: Promise<{ draft?: string }>;
}): Promise<Metadata> {
  const { slug, productSlug } = await params;
  const sp = await searchParams;
  const draft = sp.draft === "1";
  try {
    const ctx = await loadStorefrontPage(slug, draft);
    const productKey = decodeURIComponent(productSlug).trim().toLowerCase();
    const product = ctx.products.find((p) => p.slug === productKey);
    return storefrontMetadata({
      branding: ctx.branding,
      slug: ctx.storefront.slug,
      published: ctx.storefront.isPublished && !draft,
      pageTitle: product?.name ?? "Product",
      description: product?.description ?? undefined,
      imageUrl: product?.imageUrl,
    });
  } catch {
    return { title: "Product", robots: { index: false, follow: false } };
  }
}

export default async function StorefrontProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; productSlug: string }>;
  searchParams: Promise<{ draft?: string }>;
}) {
  const { slug, productSlug } = await params;
  const sp = await searchParams;
  const draft = sp.draft === "1";
  const productKey = decodeURIComponent(productSlug).trim().toLowerCase();
  if (isReservedProductSlug(productKey)) notFound();

  const ctx = await loadStorefrontPage(slug, draft);
  const enabledPages = storefrontEnabledPages(ctx.config);

  const productRow = await resolveProductForStand({
    standId: ctx.stand.id,
    slug: productKey,
    visibility: productLiveWhere,
  });
  if (!productRow) notFound();

  const hasOnline = await prisma.productChannel.findFirst({
    where: {
      productId: productRow.id,
      channelType: ProductChannelType.ONLINE,
      standId: ctx.stand.id,
      isEnabled: true,
    },
  });
  if (!hasOnline) notFound();

  const catalogProducts = ctx.products
    .filter((p) => !p.isHidden)
    .map((p) =>
      mapPublicProduct(p, {
        showExactStock: ctx.stand.showExactStock,
        showPublicScarcity: ctx.stand.showPublicScarcity,
        timeZone: ctx.stand.timezone,
      }),
    );

  const product = mapPublicProduct(productRow, {
    showExactStock: ctx.stand.showExactStock,
    showPublicScarcity: ctx.stand.showPublicScarcity,
    timeZone: ctx.stand.timezone,
  });

  return (
    <StorefrontShell
      storefrontSlug={ctx.storefront.slug}
      standSlug={ctx.stand.slug}
      branding={ctx.branding}
      activePage="product"
      enabledPages={enabledPages}
      draft={draft}
      isDraftPreview={ctx.isDraftPreview}
      fulfilmentOptions={ctx.fulfilmentOptions}
      currency={ctx.stand.currency}
    >
      <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Link
          href={shopPagePath(ctx.storefront.slug, "shop", draft)}
          className="text-sm font-semibold text-[var(--leaf-dark)] underline"
        >
          ← Back to shop
        </Link>
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt=""
            width={800}
            height={800}
            sizes="(max-width: 768px) 100vw, 640px"
            priority
            className="mt-6 aspect-square w-full rounded-[var(--storefront-radius,var(--radius))] object-cover"
          />
        ) : null}
        <h1 className="mt-6 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)]">
          {product.name}
        </h1>
        {product.isPreOrder ? (
          <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-[var(--leaf)]">
            Pre-order
          </p>
        ) : null}
        <p className="mt-3 font-receipt text-2xl text-[var(--stand-secondary,var(--ok))]">
          {formatMoney(product.priceCents, ctx.stand.currency)}
        </p>
        {product.description ? (
          <p className="mt-4 text-lg leading-relaxed text-[var(--muted)]">
            {product.description}
          </p>
        ) : null}
        {product.freshnessNote ? (
          <p className="mt-2 text-[var(--leaf-dark)]">{product.freshnessNote}</p>
        ) : null}
        {product.priceTiers.length > 0 ? (
          <p className="mt-2 text-sm text-[var(--muted)]">
            {product.priceTiers
              .map(
                (t) =>
                  `${t.qty} for ${formatMoney(t.totalCents, ctx.stand.currency)}`,
              )
              .join(" · ")}
          </p>
        ) : null}
        <div className="mt-8">
          <ProductDetailActions
            standSlug={ctx.stand.slug}
            currency={ctx.stand.currency}
            product={product}
            catalogProducts={catalogProducts}
          />
        </div>
      </article>
      <StorefrontGoToCartBar standSlug={ctx.stand.slug} branding={ctx.branding} />
    </StorefrontShell>
  );
}
