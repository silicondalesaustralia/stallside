import type { StudioMetadata } from "@/lib/studio/types";
import StudioProductCard, { type ProductCardMeta, type StudioCardPreset } from "@/components/studio/blocks/StudioProductCard";

export type ProductGridDisplay = {
  cardMeta: ProductCardMeta;
  cardPreset: StudioCardPreset;
  isFarm: boolean;
  /** Tailwind grid columns + gap. */
  gridClass: string;
  showPrice: boolean;
  showAvailability: boolean;
  showRating: boolean;
};

/** The product tiles of a Products section. */
export default function StudioProductGridList({
  products,
  display,
  className = "",
}: {
  products: StudioMetadata["products"];
  display: ProductGridDisplay;
  className?: string;
}) {
  return (
    <ul className={`grid ${display.gridClass} ${className}`}>
      {products.map((product) => (
        <li key={product.id}>
          <StudioProductCard
            product={product}
            meta={display.cardMeta}
            preset={display.cardPreset}
            showPrice={display.showPrice}
            showAvailability={display.showAvailability}
            showRating={display.showRating}
            isFarm={display.isFarm}
          />
        </li>
      ))}
    </ul>
  );
}
