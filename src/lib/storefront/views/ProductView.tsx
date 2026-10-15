import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { resolveProductForStand } from "@/lib/catalogue/channels";
import { isReservedProductSlug } from "@/lib/slug";
import { mapPublicProduct } from "@/lib/public-product";
import { productLiveWhere } from "@/lib/product-visibility";
import { ProductChannelType } from "@/generated/prisma/client";
import { loadStorefrontPage } from "@/lib/storefront/page-loader";
import { shopPagePath } from "@/lib/storefront/paths";
import { currentStorefrontBasePath } from "@/lib/tenancy/request-base-path";
import StorefrontPageShell from "@/components/storefront/StorefrontPageShell";
import StorefrontGoToCartBar from "@/components/storefront/StorefrontGoToCartBar";
import ProductFallbackArticle from "@/components/storefront/product/ProductFallbackArticle";
import { resolveStudioPublicContext } from "@/lib/studio/public-context";
import { buildStorefrontBreadcrumbs } from "@/lib/storefront/technical-seo/breadcrumbs";
import { productPageSeo } from "@/lib/seo/product-page-seo";
import { loadPrimaryCustomHostname } from "@/lib/domains/resolve";
import { COMMERCE_PRODUCT_KEY } from "@/lib/studio/commerce-pages";
import { withCommerceContext } from "@/lib/studio/commerce-context";
import { studioPageNodes } from "@/lib/studio/storage";
import StudioPublicSections from "@/lib/studio/public-render";
import { productMainCategory } from "@/lib/studio/product-main-category";
import { productRelativePath } from "@/lib/catalogue/main-category";
import { redirectWithinStorefront } from "@/lib/storefront/clean-redirect";

type ViewProps = { slug: string; productSlug: string; categorySlug?: string; draft: boolean };

/** A product at `/{main-category}/{product}` (or `/products/{product}` when uncategorised); other URLs redirect there. */
export default async function ProductView({ slug, productSlug, categorySlug, draft }: ViewProps) {
  const productKey = decodeURIComponent(productSlug).trim().toLowerCase();
  if (isReservedProductSlug(productKey)) notFound();

  const ctx = await loadStorefrontPage(slug, draft);
  const productRow = await resolveProductForStand({
    standId: ctx.stand.id,
    slug: productKey,
    visibility: productLiveWhere,
  });
  if (!productRow) {
    // Renamed products keep their redirect at /products/{old-slug}.
    if (categorySlug !== undefined) await redirectWithinStorefront(slug, productRelativePath(productKey), draft);
    notFound();
  }
  const hasOnline = await prisma.productChannel.findFirst({
    where: { productId: productRow.id, channelType: ProductChannelType.ONLINE, standId: ctx.stand.id, isEnabled: true },
  });
  if (!hasOnline) notFound();

  const mainCategory = await productMainCategory(ctx, productRow.id);
  const path = productRelativePath(productRow.slug, mainCategory?.slug);
  if (mainCategory?.slug !== categorySlug) await redirectWithinStorefront(slug, path, draft);

  const studioCtx = await resolveStudioPublicContext(ctx, draft);
  const mapOpts = {
    showExactStock: ctx.stand.showExactStock,
    showPublicScarcity: ctx.stand.showPublicScarcity,
    timeZone: ctx.stand.timezone,
  };
  const catalogProducts = ctx.products.filter((p) => !p.isHidden).map((p) => mapPublicProduct(p, mapOpts));
  const product = mapPublicProduct({ ...productRow, mainCategorySlug: mainCategory?.slug ?? null }, mapOpts);

  const primaryCustomHostname = draft ? null : await loadPrimaryCustomHostname(ctx.storefront.id);
  const breadcrumbs = buildStorefrontBreadcrumbs(
    ctx.storefront.slug,
    [
      { label: ctx.branding.headline, path: "/" },
      mainCategory
        ? { label: mainCategory.title, path: `/${encodeURIComponent(mainCategory.slug)}` }
        : { label: "Shop", path: "/shop" },
      { label: product.name },
    ],
    primaryCustomHostname,
  );
  const seo = draft
    ? undefined
    : await productPageSeo(ctx, product, path, { sku: productRow.sku, barcode: productRow.upc }, mainCategory);

  const nodes = studioCtx.active ? studioPageNodes(studioCtx.studio, COMMERCE_PRODUCT_KEY) : undefined;
  const metadata =
    studioCtx.active && nodes
      ? withCommerceContext(studioCtx.metadata, {
          kind: "product",
          product,
          category: mainCategory,
          catalogProducts,
          ownerId: ctx.owner.id,
        })
      : undefined;
  const basePath = await currentStorefrontBasePath(ctx.storefront.slug);

  return (
    <StorefrontPageShell
      ctx={ctx}
      draft={draft}
      activePage="product"
      breadcrumbs={nodes && metadata ? undefined : breadcrumbs}
      seo={seo}
    >
      {nodes && metadata ? (
        <StudioPublicSections nodes={nodes} metadata={metadata} />
      ) : (
        <ProductFallbackArticle
          product={product}
          catalogProducts={catalogProducts}
          standSlug={ctx.stand.slug}
          currency={ctx.stand.currency}
          ownerId={ctx.storefront.ownerId}
          backHref={shopPagePath(ctx.storefront.slug, "shop", draft, basePath)}
          backLabel={studioCtx.active && studioCtx.templateId === "farmhouse" ? "← Back to what's available" : "← Back to shop"}
          studioDisplay={studioCtx.active}
        />
      )}
      <StorefrontGoToCartBar standSlug={ctx.stand.slug} branding={ctx.branding} />
    </StorefrontPageShell>
  );
}
