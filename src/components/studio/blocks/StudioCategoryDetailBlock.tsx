import type { ReactNode } from "react";
import type { StudioMetadata } from "@/lib/studio/types";
import { categoryGridClass, type CategoryDetailView } from "@/lib/studio/category-detail-settings";
import RichText from "@/components/studio/RichText";
import SectionElement from "@/components/studio/SectionElement";
import SectionHeadingTag from "@/components/studio/SectionHeadingTag";
import StudioProductCard from "@/components/studio/blocks/StudioProductCard";

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
  const products = category ? meta.products.filter((p) => p.categoryIds.includes(category.id)) : meta.products;
  const centred = view.align === "centre";
  const textAlign = centred ? "mx-auto text-center" : "";
  return (
    <section className="studio-section">
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
          <ul className={`mt-8 grid gap-5 ${categoryGridClass(view)}`}>
            {products.map((product) => (
              <li key={product.id}>
                <StudioProductCard
                  product={product}
                  meta={meta}
                  preset={view.cardStyle}
                  showPrice={view.showPrice}
                  showAvailability={view.showAvailability}
                />
              </li>
            ))}
          </ul>
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
