import Link from "next/link";
import type { StudioMetadata } from "@/lib/studio/types";
import type { ProductDetailView } from "@/lib/studio/product-detail-settings";
import { shopHomePath, shopPagePath } from "@/lib/storefront/paths";
import StorefrontBreadcrumbs from "@/components/storefront/StorefrontBreadcrumbs";
import SectionCopy from "@/components/studio/SectionCopy";
import ProductGallery from "@/components/storefront/product/ProductGallery";
import ProductPhotoGrid from "@/components/storefront/product/ProductPhotoGrid";
import ProductZone from "@/components/storefront/product/ProductZone";
import ProductBlockDragProvider from "@/components/storefront/product/ProductBlockDrag";
import type { ProductBlockLayout, ProductZone as ProductZoneId } from "@/lib/studio/product-blocks";
import type { CSSProperties } from "react";

/** Featured layout columns: the main photo takes `imageSize` percent of the row. */
function featuredColumns(view: ProductDetailView): string {
  const photo = `minmax(0,${view.imageSize}fr)`;
  const details = `minmax(0,${100 - view.imageSize}fr)`;
  return view.imageOnRight ? `${details} ${photo}` : `${photo} ${details}`;
}

/** The product page: Featured (large photo, adjustable width, thumbnails under it), Classic (photo + thumbnails beside the details), Gallery (stacked photos, details stay in view) or Simple (one column). */
export default function StudioProductDetailBlock({
  showBreadcrumbs,
  showBackLink,
  view,
  metadata: meta,
  isEditing,
  onBlockLayoutChange,
}: {
  showBreadcrumbs: boolean;
  showBackLink: boolean;
  view: ProductDetailView;
  metadata: StudioMetadata;
  isEditing?: boolean;
  /** Editor only: saves a block dragged to a new place. */
  onBlockLayoutChange?: (next: ProductBlockLayout) => void;
}) {
  const product = meta.commerceContext?.product;
  if (!product) {
    if (!isEditing) return null;
    return (
      <section className="studio-section">
        <div className="studio-section__inner storefront-page-content--narrow">
          <p className="text-[var(--muted)]">Add a product to preview the product page layout.</p>
        </div>
      </section>
    );
  }

  const catalog = meta.commerceContext?.catalogProducts ?? [product];
  const backHref = shopPagePath(meta.storefrontSlug, "shop", meta.draft, meta.basePath);
  const backLabel = meta.templateId === "farmhouse" ? "← Back to what's available" : "← Back to shop";
  const crumbs = [
    { label: meta.branding.headline, href: shopHomePath(meta.storefrontSlug, meta.draft, meta.basePath) },
    { label: "Shop", href: backHref },
    { label: product.name },
  ];
  const enlarge = view.enlarge && !isEditing;
  const simple = view.layout === "simple";
  const featured = view.layout === "featured";
  const info = { product, catalog, meta, view, isEditing };
  const top = showBreadcrumbs || showBackLink ? "mt-6" : "";
  const zone = (z: ProductZoneId, className: string) => (
    <ProductZone zone={z} blocks={view.blocks[z]} info={info} className={className} />
  );

  const page = (
    <article
      className={`storefront-page-content storefront-page-content--product ${simple ? "storefront-page-content--narrow" : "storefront-page-content--wide"}`}
      data-edit-detail={isEditing ? product.id : undefined}
    >
      {showBreadcrumbs ? <StorefrontBreadcrumbs items={crumbs} className="mb-3" /> : null}
      {showBackLink ? (
        <Link href={backHref} className="text-sm font-semibold text-[var(--site-link,var(--leaf-dark))] underline">
          <SectionCopy k="backLink" fallback={backLabel} />
        </Link>
      ) : null}
      {simple ? (
        <>
          <div className={top} data-edit-field="photos">
            <ProductGallery images={product.images.slice(0, 1)} alts={product.imageAlts} name={product.name} ratio={view.imageRatio} enlarge={enlarge} variant="classic" />
          </div>
          {zone("photo", "mt-6")}
          {zone("details", "mt-6")}
          <ProductPhotoGrid images={product.images} alts={product.imageAlts} name={product.name} ratio={view.imageRatio} enlarge={enlarge} />
        </>
      ) : (
        <div
          className={`${top} grid gap-8 sf-lg:gap-12 ${featured ? "sf-md:grid-cols-[var(--pd-cols)]" : "sf-md:grid-cols-2"}`}
          style={featured ? ({ "--pd-cols": featuredColumns(view) } as CSSProperties) : undefined}
        >
          <div className={view.imageOnRight ? "sf-md:order-2" : ""}>
            <div data-edit-field="photos">
              <ProductGallery
                images={product.images}
                alts={product.imageAlts}
                name={product.name}
                ratio={view.imageRatio}
                enlarge={enlarge}
                variant={view.layout === "gallery" ? "stacked" : "classic"}
              />
            </div>
            {zone("photo", "mt-8 hidden sf-md:block")}
          </div>
          <div className={view.layout === "gallery" ? "sf-md:sticky sf-md:top-24 sf-md:self-start" : ""}>
            {zone("details", "")}
            {/* On phones, blocks placed under the photos follow the details so the buy box stays near the top. */}
            {zone("photo", "mt-6 sf-md:hidden")}
          </div>
        </div>
      )}
      {zone("below", "mt-10")}
    </article>
  );
  if (!isEditing || !onBlockLayoutChange) return page;
  return (
    <ProductBlockDragProvider layout={view.blocks} onChange={onBlockLayoutChange}>
      {page}
    </ProductBlockDragProvider>
  );
}
