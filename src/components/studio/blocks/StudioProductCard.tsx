import Image from "next/image";
import Link from "next/link";
import type { StudioMetadata } from "@/lib/studio/types";
import SalePrice from "@/components/storefront/SalePrice";
import { shopProductPath } from "@/lib/storefront/paths";
import SectionCopy from "@/components/studio/SectionCopy";
import SectionElement from "@/components/studio/SectionElement";
import RatingSummary from "@/components/studio/blocks/RatingSummary";

export type StudioCardPreset = "editorial" | "classic" | "featured" | "compact";

/** The bits of the site metadata a card needs; small enough to hand to client components. */
export type ProductCardMeta = Pick<StudioMetadata, "storefrontSlug" | "draft" | "basePath" | "currency">;

/** One product tile; name and price take the section's "Product name" / "Price" styles where it has them. */
export default function StudioProductCard({
  product,
  meta,
  preset,
  showPrice,
  showAvailability,
  showRating = false,
  isFarm,
}: {
  product: StudioMetadata["products"][number];
  meta: ProductCardMeta;
  preset: StudioCardPreset;
  showPrice: boolean;
  showAvailability: boolean;
  showRating?: boolean;
  isFarm?: boolean;
}) {
  const href = shopProductPath(meta.storefrontSlug, product, meta.draft, meta.basePath);
  const aspect = preset === "editorial" || preset === "featured" ? "aspect-[4/5]" : "aspect-square";
  const cardClass =
    preset === "editorial"
      ? "studio-product-card studio-product-card--editorial"
      : isFarm
        ? "studio-product-card studio-product-card--farm"
        : "studio-product-card";

  return (
    <Link href={href} className={`group block h-full ${cardClass}`} data-edit-product={product.id} data-section-card>
      <div className={`studio-product-card__media relative overflow-hidden rounded-[var(--studio-card-radius)] bg-[var(--wash)] ${aspect}`}>
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
            <SectionCopy k="soldOut" fallback="Sold out" />
          </span>
        ) : null}
      </div>
      <div className={preset === "featured" ? "mt-4 sf-sm:flex sf-sm:items-end sf-sm:justify-between sf-sm:gap-4" : "mt-3"}>
        <SectionElement el="productName" className="font-semibold leading-snug text-[var(--field)] group-hover:text-[var(--leaf-dark)]">
          {product.name}
        </SectionElement>
        {showPrice ? (
          <SectionElement el="productPrice" className="mt-1 text-sm text-[var(--muted)] sf-sm:mt-0">
            <SalePrice priceCents={product.priceCents} compareAtPriceCents={product.compareAtPriceCents} currency={meta.currency} />
          </SectionElement>
        ) : null}
        {showRating ? <RatingSummary rating={product.rating} className="mt-1" /> : null}
        {showAvailability && product.soldOut && product.label ? (
          <p className="mt-1 text-xs text-[var(--muted)]">{product.label}</p>
        ) : null}
      </div>
    </Link>
  );
}
