import Image from "next/image";
import Link from "next/link";
import type { StudioMetadata } from "@/lib/studio/types";
import { formatMoney } from "@/lib/public-product";
import { shopProductPath } from "@/lib/storefront/paths";
import type { ProductPreset as ExtendedProductPreset } from "@/lib/studio/preset-registry";
import { mapProductPreset } from "@/lib/studio/preset-registry";

type Props = {
  source: "all" | "category" | "manual" | "activeCategory";
  categoryId: string;
  productIds: string[];
  limit: number;
  preset: ExtendedProductPreset | "editorial" | "classic" | "featured" | "compact";
  columns: 2 | 3 | 4;
  heading: string;
  showPrice: boolean;
  showAvailability: boolean;
  metadata: StudioMetadata;
  isEditing?: boolean;
};

export default function StudioProductsBlock({
  source,
  categoryId,
  productIds,
  limit,
  preset,
  columns,
  heading,
  showPrice,
  showAvailability,
  metadata: meta,
  isEditing,
}: Props) {
  const mappedPreset = mapProductPreset(meta.templateId, preset);
  const isDense = meta.templateId === "market" || preset === "dense" || preset === "list";
  const isFarm = meta.templateId === "farmhouse" || preset === "farm-grid" || preset === "availability";

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

  const headingText =
    source === "activeCategory" && meta.commerceContext?.category?.title
      ? meta.commerceContext.category.title
      : heading;

  const products = pool.slice(0, Math.max(1, Math.min(limit, 12)));

  if (products.length === 0) {
    if (!isEditing) return null;
    return (
      <section className="studio-section">
        <div className="studio-section__inner">
          <h2 className="studio-heading">{headingText || "Our bakes"}</h2>
          <p className="mt-3 text-[var(--muted)]">Add products to show them here.</p>
          <Link href="/dashboard/products/new" className="studio-btn studio-btn--secondary mt-4">
            Add product
          </Link>
        </div>
      </section>
    );
  }

  const colClass =
    mappedPreset === "compact" || isDense
      ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      : mappedPreset === "featured"
        ? "grid-cols-1 sm:grid-cols-2"
        : columns === 4 || isDense
          ? "grid-cols-2 lg:grid-cols-4"
          : columns === 3
            ? "grid-cols-2 lg:grid-cols-3"
            : "grid-cols-2";

  const sectionClass = isFarm ? "studio-section studio-section--wash" : "studio-section";
  const cardPreset = mappedPreset;

  return (
    <section className={sectionClass}>
      <div className="studio-section__inner">
        <h2 className="studio-heading">{headingText || "Our bakes"}</h2>
        <ul className={`mt-8 grid ${isDense ? "gap-3" : "gap-5"} ${colClass}`}>
          {products.map((product) => (
            <li key={product.id}>
              <ProductCard
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

function ProductCard({
  product,
  meta,
  preset,
  showPrice,
  showAvailability,
  isFarm,
}: {
  product: StudioMetadata["products"][number];
  meta: StudioMetadata;
  preset: "editorial" | "classic" | "featured" | "compact";
  showPrice: boolean;
  showAvailability: boolean;
  isFarm?: boolean;
}) {
  const href = shopProductPath(meta.storefrontSlug, product.slug, meta.draft, meta.basePath);
  const aspect = preset === "editorial" || preset === "featured" ? "aspect-[4/5]" : "aspect-square";
  const cardClass =
    preset === "editorial"
      ? "studio-product-card studio-product-card--editorial"
      : isFarm
        ? "studio-product-card studio-product-card--farm"
        : "studio-product-card";

  return (
    <Link href={href} className={`group block ${cardClass}`}>
      <div className={`relative overflow-hidden rounded-[var(--studio-card-radius)] bg-[var(--wash)] ${aspect}`}>
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
            sizes="(max-width:768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-end bg-gradient-to-br from-[var(--wash)] to-[var(--line)] p-4">
            <span className="studio-product-card__fallback text-sm font-medium text-[var(--muted)]">
              {product.name}
            </span>
          </div>
        )}
        {showAvailability && product.soldOut ? (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-[var(--gone)]">
            Sold out
          </span>
        ) : null}
      </div>
      <div className={preset === "featured" ? "mt-4 sm:flex sm:items-end sm:justify-between sm:gap-4" : "mt-3"}>
        <p className="font-semibold leading-snug text-[var(--field)] group-hover:text-[var(--leaf-dark)]">
          {product.name}
        </p>
        {showPrice ? (
          <p className="mt-1 text-sm text-[var(--muted)] sm:mt-0">
            {formatMoney(product.priceCents, meta.currency)}
          </p>
        ) : null}
        {showAvailability && product.soldOut && product.label ? (
          <p className="mt-1 text-xs text-[var(--muted)]">{product.label}</p>
        ) : null}
      </div>
    </Link>
  );
}
