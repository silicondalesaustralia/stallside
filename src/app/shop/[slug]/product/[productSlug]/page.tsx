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
import { loadStorefrontPage } from "@/lib/storefront/page-loader";
import {
  buildStorefrontPageMetadata,
  seoConfigSource,
} from "@/lib/studio/resolve-seo-metadata";
import { shopPagePath } from "@/lib/storefront/paths";
import { currentStorefrontBasePath } from "@/lib/tenancy/request-base-path";
import StorefrontPageShell from "@/components/storefront/StorefrontPageShell";
import StorefrontGoToCartBar from "@/components/storefront/StorefrontGoToCartBar";
import ProductDetailActions from "@/app/s/[standSlug]/ProductDetailActions";
import { ProductApprovedReviews } from "@/components/storefront/ProductApprovedReviews";
import { resolveStudioPublicContext } from "@/lib/studio/public-context";
import { storefrontPublicUrl } from "@/lib/tenancy/public-url";
import { buildStorefrontBreadcrumbs } from "@/lib/storefront/technical-seo/breadcrumbs";
import {
  productSchemaNode,
  storefrontSchemaGraph,
} from "@/lib/storefront/technical-seo/schema";
import { loadPrimaryCustomHostname } from "@/lib/domains/resolve";
import { COMMERCE_PRODUCT_KEY } from "@/lib/studio/commerce-pages";
import { withCommerceContext } from "@/lib/studio/commerce-context";
import { studioPageNodes } from "@/lib/studio/storage";
import StudioPublicSections from "@/lib/studio/public-render";

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
    const seoRow = product
      ? await prisma.product.findUnique({
          where: { id: product.id },
          select: { seoTitle: true, seoDescription: true },
        })
      : null;
    const configRaw = seoConfigSource(
      ctx.storefront.draftConfig,
      ctx.storefront.publishedConfig,
      ctx.storefront.isPublished && !draft,
    );
    return buildStorefrontPageMetadata({
      branding: ctx.branding,
      slug: ctx.storefront.slug,
      published: ctx.storefront.isPublished && !draft,
      configRaw,
      entityType: "product",
      entityId: product?.id,
      defaults: {
        title: seoRow?.seoTitle ?? product?.name ?? "Product",
        description:
          seoRow?.seoDescription ?? product?.description ?? product?.name ?? "Product",
        ogImageUrl: product?.imageUrl,
      },
      path: product ? `/product/${encodeURIComponent(product.slug)}` : undefined,
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
  const studioCtx = await resolveStudioPublicContext(ctx, draft);
  const basePath = await currentStorefrontBasePath(ctx.storefront.slug);

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

  const backLabel = studioCtx.active && studioCtx.templateId === "farmhouse"
    ? "← Back to what's available"
    : "← Back to shop";

  const primaryCustomHostname = draft
    ? null
    : await loadPrimaryCustomHostname(ctx.storefront.id);
  const pageUrl = storefrontPublicUrl(ctx.storefront.slug, {
    path: `/product/${product.slug}`,
    primaryCustomHostname,
  });
  const breadcrumbSegments = [
    { label: ctx.branding.headline, path: "/" },
    { label: "Shop", path: "/shop" },
    { label: product.name },
  ];
  const breadcrumbs = buildStorefrontBreadcrumbs(
    ctx.storefront.slug,
    breadcrumbSegments,
    primaryCustomHostname,
  );
  const schemaGraph = draft
    ? undefined
    : storefrontSchemaGraph({
        slug: ctx.storefront.slug,
        branding: ctx.branding,
        pageUrl,
        breadcrumbSegments,
        primaryCustomHostname,
        extra: [
          productSchemaNode({
            slug: ctx.storefront.slug,
            product,
            currency: ctx.stand.currency,
            pageUrl,
            branding: ctx.branding,
          }),
        ],
      });

  const nodes =
    studioCtx.active
      ? studioPageNodes(studioCtx.studio, COMMERCE_PRODUCT_KEY)
      : undefined;
  const metadata =
    studioCtx.active && nodes
      ? withCommerceContext(studioCtx.metadata, {
          kind: "product",
          product,
          catalogProducts,
          ownerId: ctx.owner.id,
        })
      : undefined;

  return (
    <StorefrontPageShell
      ctx={ctx}
      draft={draft}
      activePage="product"
      breadcrumbs={breadcrumbs}
      schemaGraph={schemaGraph}
    >
      {nodes && metadata ? (
        <StudioPublicSections nodes={nodes} metadata={metadata} />
      ) : (
        <article className="storefront-page-content storefront-page-content--narrow">
          <Link
            href={shopPagePath(ctx.storefront.slug, "shop", draft, basePath)}
            className="text-sm font-semibold text-[var(--leaf-dark)] underline"
          >
            {backLabel}
          </Link>
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt=""
              width={800}
              height={800}
              sizes="(max-width: 768px) 100vw, 640px"
              priority
              className="mt-6 aspect-square w-full rounded-[var(--studio-card-radius,var(--storefront-radius,var(--radius)))] object-cover"
            />
          ) : null}
          <h1
            className={`mt-6 text-3xl font-bold tracking-tight text-[var(--field)] ${studioCtx.active ? "studio-display" : "font-[family-name:var(--font-display)]"}`}
          >
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
          <ProductApprovedReviews
            ownerId={ctx.storefront.ownerId}
            productId={productRow.id}
          />
        </article>
      )}
      <StorefrontGoToCartBar standSlug={ctx.stand.slug} branding={ctx.branding} />
    </StorefrontPageShell>
  );
}
