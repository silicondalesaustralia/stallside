import Link from "next/link";
import type { StudioMetadata } from "@/lib/studio/types";
import type { ProductDetailView } from "@/lib/studio/product-detail-settings";
import { shopHomePath, shopPagePath } from "@/lib/storefront/paths";
import StorefrontBreadcrumbs from "@/components/storefront/StorefrontBreadcrumbs";
import SectionCopy from "@/components/studio/SectionCopy";
import ProductGallery from "@/components/storefront/product/ProductGallery";
import ProductPhotoGrid from "@/components/storefront/product/ProductPhotoGrid";
import ProductDetailInfo from "@/components/storefront/product/ProductDetailInfo";

/** The product page: Classic (photo + thumbnails beside the details), Gallery (stacked photos, details stay in view) or Simple (one column). */
export default function StudioProductDetailBlock({
  showBreadcrumbs,
  showBackLink,
  view,
  metadata: meta,
  isEditing,
}: {
  showBreadcrumbs: boolean;
  showBackLink: boolean;
  view: ProductDetailView;
  metadata: StudioMetadata;
  isEditing?: boolean;
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
  const info = { product, catalog, meta, view, isEditing };
  const top = showBreadcrumbs || showBackLink ? "mt-6" : "";

  return (
    <article className={`storefront-page-content ${simple ? "storefront-page-content--narrow" : "storefront-page-content--wide"}`}>
      {showBreadcrumbs ? <StorefrontBreadcrumbs items={crumbs} className="mb-3" /> : null}
      {showBackLink ? (
        <Link href={backHref} className="text-sm font-semibold text-[var(--site-link,var(--leaf-dark))] underline">
          <SectionCopy k="backLink" fallback={backLabel} />
        </Link>
      ) : null}
      {simple ? (
        <>
          <div className={top}>
            <ProductGallery images={product.images.slice(0, 1)} name={product.name} ratio={view.imageRatio} enlarge={enlarge} variant="classic" />
          </div>
          <ProductDetailInfo {...info} className="mt-6" />
          <ProductPhotoGrid images={product.images} name={product.name} ratio={view.imageRatio} enlarge={enlarge} />
        </>
      ) : (
        <div className={`${top} grid gap-8 sf-md:grid-cols-2 sf-lg:gap-12`}>
          <div className={view.imageOnRight ? "sf-md:order-2" : ""}>
            <ProductGallery
              images={product.images}
              name={product.name}
              ratio={view.imageRatio}
              enlarge={enlarge}
              variant={view.layout === "gallery" ? "stacked" : "classic"}
            />
          </div>
          <ProductDetailInfo {...info} className={view.layout === "gallery" ? "sf-md:sticky sf-md:top-24 sf-md:self-start" : ""} />
        </div>
      )}
    </article>
  );
}
