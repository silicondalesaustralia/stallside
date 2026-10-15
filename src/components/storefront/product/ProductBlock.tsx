import type { StudioMetadata } from "@/lib/studio/types";
import type { PublicProductCard } from "@/lib/public-product";
import { formatMoney } from "@/lib/public-product";
import type { ProductDetailView } from "@/lib/studio/product-detail-settings";
import type { ProductBlockId } from "@/lib/studio/product-blocks";
import SectionHeadingTag from "@/components/studio/SectionHeadingTag";
import SectionCopy from "@/components/studio/SectionCopy";
import SectionElement from "@/components/studio/SectionElement";
import ProductDescription from "./ProductDescription";
import ProductBuyBox from "./ProductBuyBox";
import ProductInfoRows from "./ProductInfoRows";
import ProductInfoTabs from "./ProductInfoTabs";
import ProductRatingLink from "./ProductRatingLink";

export type ProductBlockInfo = {
  product: PublicProductCard;
  catalog: PublicProductCard[];
  meta: StudioMetadata;
  view: ProductDetailView;
  isEditing?: boolean;
};

/** One movable part of the product page (name, price, description, buy box, info lines or tabs). */
export default function ProductBlock({ id, info }: { id: ProductBlockId; info: ProductBlockInfo }) {
  const { product, catalog, meta, view, isEditing } = info;
  switch (id) {
    case "name":
      return (
        <div>
          <SectionHeadingTag defaultTag="h1" el="name" className="studio-display text-3xl font-bold tracking-tight text-[var(--field)]">
            {product.name}
          </SectionHeadingTag>
          {product.isPreOrder ? (
            <SectionElement el="badge" className="mt-2 text-sm font-semibold uppercase tracking-wide text-[var(--leaf)]">
              <SectionCopy k="preOrderBadge" fallback="Pre-order" />
            </SectionElement>
          ) : null}
        </div>
      );
    case "rating":
      return view.showRating ? <ProductRatingLink productId={product.id} meta={meta} isEditing={isEditing} /> : null;
    case "price":
      return (
        <SectionElement el="price" className="mt-3 font-receipt text-2xl text-[var(--stand-secondary,var(--ok))]">
          {formatMoney(product.priceCents, meta.currency)}
        </SectionElement>
      );
    case "description":
      return product.description ? <ProductDescription value={product.description} /> : null;
    case "buy":
      return (
        <div>
          <ProductBuyBox
            standSlug={meta.standSlug}
            currency={meta.currency}
            product={product}
            catalogProducts={catalog}
            stickyCart={view.stickyCart && !isEditing}
            paymentBrands={view.showPayments ? meta.paymentBrands : []}
            buttons={view.buttons}
            buttonWidth={view.buttonWidth}
          />
        </div>
      );
    case "infoRows":
      return <ProductInfoRows rows={view.infoRows} />;
    case "tabs":
      return <ProductInfoTabs tabs={view.tabs} />;
  }
}
