import Link from "next/link";
import type { StudioMetadata } from "@/lib/studio/types";
import type { ProductPreset as ExtendedProductPreset } from "@/lib/studio/preset-registry";
import { productGridLook } from "@/lib/studio/product-grid-look";
import StudioSectionHeading from "@/components/studio/StudioSectionHeading";
import StudioCategoryIntro from "@/components/studio/blocks/StudioCategoryIntro";
import StudioProductGridList, { type ProductGridDisplay } from "@/components/studio/blocks/StudioProductGridList";
import StudioProductBrowser from "@/components/studio/blocks/StudioProductBrowser";
import { isBrowsePage, isCategoryPage, productGridPool, type ProductGridSource } from "@/lib/studio/product-grid-pool";

type Props = {
  source: ProductGridSource;
  categoryId: string;
  productIds: string[];
  limit: number;
  preset: ExtendedProductPreset | "editorial" | "classic" | "featured" | "compact";
  columns: 1 | 2 | 3 | 4;
  /** Where a 1-column list sits. */
  align?: "left" | "centre";
  heading: string;
  showPrice: boolean;
  showAvailability: boolean;
  showRatings?: boolean;
  /** Category pages only: the category's name and description above the grid. */
  showCategoryIntro?: boolean;
  metadata: StudioMetadata;
  isEditing?: boolean;
  editable?: boolean;
};

export default function StudioProductsBlock({
  source,
  categoryId,
  productIds,
  limit,
  preset,
  columns,
  align = "left",
  heading,
  showPrice,
  showAvailability,
  showRatings = false,
  showCategoryIntro = true,
  metadata: meta,
  isEditing,
  editable = false,
}: Props) {
  const look = productGridLook(meta.templateId, preset);
  const isDense = look.dense;
  const isFarm = look.farm;

  const onCategoryPage = isCategoryPage(meta);
  const products = productGridPool({ source, categoryId, productIds, limit, meta });
  const single = columns === 1;
  const centred = single && align === "centre";

  const displayHeading =
    !editable &&
    source === "activeCategory" &&
    meta.commerceContext?.category?.title
      ? meta.commerceContext.category.title
      : heading;

  const title = onCategoryPage ? (
    showCategoryIntro ? (
      <StudioCategoryIntro category={meta.commerceContext?.category} centred={centred} isEditing={isEditing} />
    ) : null
  ) : (
    <StudioSectionHeading
      editable={editable}
      value={heading}
      fallback={displayHeading || "Our bakes"}
      placeholder="Product section heading"
    />
  );

  if (products.length === 0) {
    if (!isEditing) return null;
    return (
      <section className="studio-section">
        <div className="studio-section__inner">
          {title}
          <p className="mt-3 text-[var(--muted)]">
            {onCategoryPage
              ? source === "manual"
                ? "Choose products from this category to show them here."
                : "No products in this category yet."
              : "Add products to show them here."}
          </p>
          <Link href="/dashboard/products/new" className="studio-btn studio-btn--secondary mt-4">
            Add product
          </Link>
        </div>
      </section>
    );
  }

  const colClass = single
    ? `w-full max-w-md grid-cols-1 ${centred ? "mx-auto" : ""}`
    : look.presetGrid ??
      (columns === 4
        ? "grid-cols-2 sf-lg:grid-cols-4"
        : columns === 3
          ? "grid-cols-2 sf-lg:grid-cols-3"
          : "grid-cols-2");

  const sectionClass = isFarm ? "studio-section studio-section--wash" : "studio-section";
  const display: ProductGridDisplay = {
    cardMeta: { storefrontSlug: meta.storefrontSlug, draft: meta.draft, basePath: meta.basePath, currency: meta.currency },
    cardPreset: look.card,
    isFarm,
    gridClass: `${isDense ? "gap-3" : "gap-5"} ${colClass}`,
    showPrice,
    showAvailability,
    showRating: showRatings,
  };
  const browse = isBrowsePage(meta);

  return (
    <section className={sectionClass}>
      <div className="studio-section__inner">
        {centred && !onCategoryPage ? <div className="text-center">{title}</div> : title}
        {browse ? (
          <div className={title ? "mt-8" : ""}>
            <StudioProductBrowser
              products={products}
              categories={onCategoryPage ? [] : meta.categories.map((c) => ({ id: c.id, title: c.title }))}
              display={display}
            />
          </div>
        ) : (
          <StudioProductGridList products={products} display={display} className={title ? "mt-8" : ""} />
        )}
      </div>
    </section>
  );
}
