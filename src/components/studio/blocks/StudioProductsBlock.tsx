import Link from "next/link";
import type { StudioMetadata } from "@/lib/studio/types";
import type { ProductPreset as ExtendedProductPreset } from "@/lib/studio/preset-registry";
import { productGridLook } from "@/lib/studio/product-grid-look";
import StudioSectionHeading from "@/components/studio/StudioSectionHeading";
import StudioProductCard from "@/components/studio/blocks/StudioProductCard";

type Props = {
  source: "all" | "category" | "manual" | "activeCategory";
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
  metadata: meta,
  isEditing,
  editable = false,
}: Props) {
  const look = productGridLook(meta.templateId, preset);
  const isDense = look.dense;
  const isFarm = look.farm;

  let pool = meta.products;
  if (source === "manual" && productIds.length > 0) {
    pool = productIds
      .map((id) => meta.products.find((p) => p.id === id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));
  } else if (source === "activeCategory") {
    const catId = meta.commerceContext?.category?.id ?? categoryId;
    pool = catId
      ? meta.products.filter((p) => p.categoryIds.includes(catId))
      : meta.products;
  } else if (source === "category" && categoryId) {
    pool = meta.products.filter((p) => p.categoryIds.includes(categoryId));
  }

  const displayHeading =
    !editable &&
    source === "activeCategory" &&
    meta.commerceContext?.category?.title
      ? meta.commerceContext.category.title
      : heading;

  const products = pool.slice(0, Math.max(1, Math.min(limit, 12)));
  const title = (
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
          <p className="mt-3 text-[var(--muted)]">Add products to show them here.</p>
          <Link href="/dashboard/products/new" className="studio-btn studio-btn--secondary mt-4">
            Add product
          </Link>
        </div>
      </section>
    );
  }

  const single = columns === 1;
  const centred = single && align === "centre";
  const colClass = single
    ? `w-full max-w-md grid-cols-1 ${centred ? "mx-auto" : ""}`
    : look.presetGrid ??
      (columns === 4
        ? "grid-cols-2 sf-lg:grid-cols-4"
        : columns === 3
          ? "grid-cols-2 sf-lg:grid-cols-3"
          : "grid-cols-2");

  const sectionClass = isFarm ? "studio-section studio-section--wash" : "studio-section";
  const cardPreset = look.card;

  return (
    <section className={sectionClass}>
      <div className="studio-section__inner">
        {centred ? <div className="text-center">{title}</div> : title}
        <ul className={`mt-8 grid ${isDense ? "gap-3" : "gap-5"} ${colClass}`}>
          {products.map((product) => (
            <li key={product.id}>
              <StudioProductCard
                product={product}
                meta={meta}
                preset={cardPreset}
                showPrice={showPrice}
                showAvailability={showAvailability}
                isFarm={isFarm}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
