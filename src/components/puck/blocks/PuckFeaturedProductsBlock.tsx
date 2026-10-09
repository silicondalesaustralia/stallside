import Image from "next/image";
import Link from "next/link";
import type { PuckSpikeMetadata } from "@/lib/puck/types";
import { formatMoney } from "@/lib/public-product";
import { shopProductPath } from "@/lib/storefront/paths";

type FeaturedProductsProps = {
  source: "all" | "category" | "manual";
  categoryId: string;
  productIds: string[];
  limit: number;
  layout: "grid" | "list";
  columns: 2 | 3 | 4;
  showPrice: boolean;
  showAvailability: boolean;
};

export default function PuckFeaturedProductsBlock({
  source,
  categoryId,
  productIds,
  limit,
  layout,
  columns,
  showPrice,
  showAvailability,
  puck,
}: FeaturedProductsProps & {
  puck: { metadata: PuckSpikeMetadata; isEditing: boolean };
}) {
  const meta = puck.metadata;
  let pool = meta.products;

  if (source === "manual" && productIds.length > 0) {
    pool = productIds
      .map((id) => meta.products.find((p) => p.id === id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));
  } else if (source === "category" && categoryId) {
    pool = meta.products.filter((p) => p.categoryIds.includes(categoryId));
  }

  const products = pool.slice(0, Math.max(1, Math.min(limit, 12)));
  const colClass =
    layout === "list"
      ? "grid-cols-1"
      : columns === 4
        ? "sm:grid-cols-2 lg:grid-cols-4"
        : columns === 3
          ? "sm:grid-cols-2 lg:grid-cols-3"
          : "sm:grid-cols-2";

  if (products.length === 0) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
          Products
        </h2>
        <p className="mt-4 text-[var(--muted)]">
          Add products to display them here.
        </p>
        {puck.isEditing ? (
          <Link
            href="/dashboard/products/new"
            className="mt-4 inline-flex rounded-full bg-[var(--field)] px-4 py-2 text-sm font-semibold text-white"
          >
            Add product
          </Link>
        ) : null}
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h2 className="mb-6 font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
        Products
      </h2>
      <div className={`grid grid-cols-1 gap-4 ${colClass}`}>
        {products.map((product) => (
          <Link
            key={product.id}
            href={shopProductPath(
              meta.storefrontSlug,
              product.slug,
              meta.draft,
              meta.basePath,
            )}
            className={`group overflow-hidden rounded-[var(--storefront-radius,var(--radius))] border border-[var(--line)] bg-white ${
              layout === "list" ? "flex flex-row" : ""
            }`}
          >
            <div
              className={`relative bg-[var(--wash)] ${
                layout === "list" ? "aspect-square w-28 shrink-0" : "aspect-square"
              }`}
            >
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="25vw"
                />
              ) : null}
            </div>
            <div className="p-4">
              <p className="font-semibold text-[var(--field)]">{product.name}</p>
              {showPrice ? (
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {formatMoney(product.priceCents, meta.currency)}
                </p>
              ) : null}
              {showAvailability && product.soldOut ? (
                <p className="mt-1 text-xs font-medium text-[var(--gone)]">
                  {product.label}
                </p>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
