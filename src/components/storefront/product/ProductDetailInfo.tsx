import type { StudioMetadata } from "@/lib/studio/types";
import type { PublicProductCard } from "@/lib/public-product";
import { formatMoney } from "@/lib/public-product";
import type { ProductDetailView } from "@/lib/studio/product-detail-settings";
import SectionHeadingTag from "@/components/studio/SectionHeadingTag";
import SectionCopy from "@/components/studio/SectionCopy";
import SectionElement from "@/components/studio/SectionElement";
import CartButtonLabels from "@/components/studio/CartButtonLabels";
import ProductDescription from "./ProductDescription";
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
      <SectionHeadingTag defaultTag="h1" el="name" className="studio-display text-3xl font-bold tracking-tight text-[var(--field)]">
        {product.name}
      </SectionHeadingTag>
      {product.isPreOrder ? (
        <SectionElement el="badge" className="mt-2 text-sm font-semibold uppercase tracking-wide text-[var(--leaf)]">
          <SectionCopy k="preOrderBadge" fallback="Pre-order" />
        </SectionElement>
      ) : null}
      <SectionElement el="price" className="mt-3 font-receipt text-2xl text-[var(--stand-secondary,var(--ok))]">
        {formatMoney(product.priceCents, meta.currency)}
      </SectionElement>
      {product.description ? <ProductDescription value={product.description} /> : null}
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
