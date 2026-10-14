"use client";

import { useRef } from "react";
import ProductDetailActions from "@/app/s/[standSlug]/ProductDetailActions";
import { useSectionText } from "@/components/studio/SectionStyleContext";
import { formatMoney, type PublicProductCard } from "@/lib/public-product";
import type { PaymentBrand } from "@/lib/payment-brand-assets";
import ProductStickyCart from "./ProductStickyCart";
import ProductPaymentStrip from "./ProductPaymentStrip";

/** Options, quantity and Add to cart, plus the phone sticky bar that mirrors them. */
export default function ProductBuyBox({
  standSlug,
  currency,
  product,
  catalogProducts,
  stickyCart,
  paymentBrands,
}: {
  standSlug: string;
  currency: string;
  product: PublicProductCard;
  catalogProducts: PublicProductCard[];
  stickyCart: boolean;
  paymentBrands: PaymentBrand[];
}) {
  const actionsRef = useRef<HTMLDivElement>(null);
  const addLabel = useSectionText("addToCart", "Add to cart");
  return (
    <>
      <div ref={actionsRef} className="mt-8">
        <ProductDetailActions standSlug={standSlug} currency={currency} product={product} catalogProducts={catalogProducts} />
        <ProductPaymentStrip brands={paymentBrands} />
      </div>
      {stickyCart ? (
        <ProductStickyCart
          actionsRef={actionsRef}
          name={product.name}
          price={formatMoney(product.priceCents, currency)}
          hasOptions={product.hasOptions}
          soldOut={product.soldOut}
          addLabel={addLabel}
        />
      ) : null}
    </>
  );
}
