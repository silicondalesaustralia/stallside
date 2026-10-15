import type { ReactNode } from "react";
import type { StudioMetadata } from "@/lib/studio/types";
import { defaultProductPreset } from "@/lib/studio/preset-registry";
import { productGridLook } from "@/lib/studio/product-grid-look";
import { categoryGridClass, type CategoryDetailView } from "@/lib/studio/category-detail-settings";
import RichText from "@/components/studio/RichText";
import SectionElement from "@/components/studio/SectionElement";
import SectionHeadingTag from "@/components/studio/SectionHeadingTag";
import type { ProductGridDisplay } from "@/components/studio/blocks/StudioProductGridList";
import StudioProductBrowser from "@/components/studio/blocks/StudioProductBrowser";

const HINT = "rounded-lg border border-dashed border-[var(--line)] px-3 py-2 text-sm text-[var(--muted)]";

function Description({ el, value, hint, isEditing, className }: {
  el: string;
  value: string | null | undefined;
  hint: string;
  isEditing?: boolean;
  className: string;
}): ReactNode {
  if (value?.trim()) {
    return (
      <SectionElement el={el} as="div" className={className}>
        <RichText value={value} />
      </SectionElement>
    );
  }
  return isEditing ? <p className={`${className} ${HINT}`}>{hint}</p> : null;
}

/** The current category: its title, top description, products and bottom description. */
export default function StudioCategoryDetailBlock({
  view,
  metadata: meta,
  isEditing,
}: {
  view: CategoryDetailView;
  metadata: StudioMetadata;
  isEditing?: boolean;
}) {
  const category = meta.commerceContext?.category;
  const products = category ? meta.products.filter((p) => p.categoryIds.includes(category.id)) : [];
  const centred = view.align === "centre";
  const textAlign = centred ? "mx-auto text-center" : "";
  const look = productGridLook(meta.templateId, view.preset ?? defaultProductPreset(meta.templateId));
  const display: ProductGridDisplay = {
    cardMeta: { storefrontSlug: meta.storefrontSlug, draft: meta.draft, basePath: meta.basePath, currency: meta.currency },
    cardPreset: look.card,
    isFarm: look.farm,
    gridClass: `${look.dense ? "gap-3" : "gap-5"} ${look.presetGrid ?? categoryGridClass(view)}`,
    showPrice: view.showPrice,
    showAvailability: view.showAvailability,
    showRating: view.showRatings,
  };
  return (
    <section
      className={look.farm ? "studio-section studio-section--wash" : "studio-section"}
      data-card-background={view.cardBackground === "none" ? "none" : undefined}
    >
      <div className="studio-section__inner">
        {view.showTitle ? (
          <SectionHeadingTag defaultTag="h1" el="title" className={`studio-heading ${centred ? "text-center" : ""}`}>
            {category?.title || "Category name"}
          </SectionHeadingTag>
        ) : null}
        {view.showTopDescription ? (
          <Description
            el="topDescription"
            value={category?.description}
            hint="Top description: add it on this category's page in the dashboard."
            isEditing={isEditing}
            className={`mt-3 max-w-3xl text-lg leading-relaxed text-[var(--muted)] ${textAlign}`}
          />
        ) : null}
        {products.length > 0 ? (
          <div className="mt-8">
            <StudioProductBrowser products={products} categories={[]} display={display} />
          </div>
        ) : (
          <p className="mt-8 text-[var(--muted)]">No products in this category yet.</p>
        )}
        {view.showBottomDescription ? (
          <Description
            el="bottomDescription"
            value={category?.bottomDescription}
            hint="Bottom description: add it on this category's page in the dashboard."
            isEditing={isEditing}
            className={`mt-12 max-w-3xl leading-relaxed text-[var(--muted)] ${textAlign}`}
          />
        ) : null}
      </div>
    </section>
  );
}
