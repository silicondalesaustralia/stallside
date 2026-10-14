import type { StudioMetadata } from "@/lib/studio/types";
import type { PublicProductCard } from "@/lib/public-product";
import { formatMoney } from "@/lib/public-product";
import type { ProductDetailView } from "@/lib/studio/product-detail-settings";
import SectionHeadingTag from "@/components/studio/SectionHeadingTag";
import SectionCopy from "@/components/studio/SectionCopy";
import CartButtonLabels from "@/components/studio/CartButtonLabels";
import RichText from "@/components/studio/RichText";
import ProductBuyBox from "./ProductBuyBox";
import ProductInfoRows from "./ProductInfoRows";
import ProductInfoTabs from "./ProductInfoTabs";

/** Name, price, description, buy box, info rows and tabs: the text side of a product page. */
export default function ProductDetailInfo({
  product,
  catalog,
  meta,
  view,
  isEditing,
  className = "",
}: {
  product: PublicProductCard;
  catalog: PublicProductCard[];
  meta: StudioMetadata;
  view: ProductDetailView;
  isEditing?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <SectionHeadingTag defaultTag="h1" className="studio-display text-3xl font-bold tracking-tight text-[var(--field)]">
        {product.name}
      </SectionHeadingTag>
      {product.isPreOrder ? (
        <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-[var(--leaf)]">
          <SectionCopy k="preOrderBadge" fallback="Pre-order" />
        </p>
      ) : null}
      <p className="mt-3 font-receipt text-2xl text-[var(--stand-secondary,var(--ok))]">
        {formatMoney(product.priceCents, meta.currency)}
      </p>
      {product.description ? (
        <RichText value={product.description} className="mt-4 text-lg leading-relaxed text-[var(--muted)]" />
      ) : null}
      <CartButtonLabels />
      <ProductBuyBox
        standSlug={meta.standSlug}
        currency={meta.currency}
        product={product}
        catalogProducts={catalog}
        stickyCart={view.stickyCart && !isEditing}
        paymentBrands={view.showPayments ? meta.paymentBrands : []}
      />
      <ProductInfoRows rows={view.infoRows} />
      <ProductInfoTabs tabs={view.tabs} />
    </div>
  );
}
