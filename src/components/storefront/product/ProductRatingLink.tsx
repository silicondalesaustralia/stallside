import type { StudioMetadata } from "@/lib/studio/types";
import RatingSummary from "@/components/studio/blocks/RatingSummary";

export const PRODUCT_REVIEWS_ANCHOR = "product-reviews";

/** The product's stars and review count, linking down to its reviews; a placeholder in the builder when it has none. */
export default function ProductRatingLink({
  productId,
  meta,
  isEditing,
}: {
  productId: string;
  meta: StudioMetadata;
  isEditing?: boolean;
}) {
  const rating = meta.products.find((p) => p.id === productId)?.rating ?? null;
  const summary = <RatingSummary rating={rating} isEditing={isEditing} className="mt-2" />;
  if (isEditing || !rating?.count) return summary;
  return (
    <a href={`#${PRODUCT_REVIEWS_ANCHOR}`} className="inline-block hover:opacity-80">
      {summary}
    </a>
  );
}
