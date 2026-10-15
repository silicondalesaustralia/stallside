import { formatMoney } from "@/lib/money";
import { isOnSale } from "@/lib/product-sale-price";

/**
 * A product price; while on sale, the old price follows it crossed out with the site's "Sale" badge.
 * Inline only, so it can sit inside any price element.
 */
export default function SalePrice({
  priceCents,
  compareAtPriceCents,
  currency,
  prefix = "",
}: {
  priceCents: number;
  compareAtPriceCents?: number | null;
  currency: string;
  prefix?: string;
}) {
  const price = `${prefix}${formatMoney(priceCents, currency)}`;
  if (!isOnSale(priceCents, compareAtPriceCents)) return <>{price}</>;
  return (
    <span className="sale-price">
      <span className="sale-price__now">{price}</span>{" "}
      <s className="sale-price__was">
        <span className="sr-only">Was </span>
        {formatMoney(compareAtPriceCents!, currency)}
      </s>{" "}
      <span className="sale-badge" data-sale-badge="" />
    </span>
  );
}
