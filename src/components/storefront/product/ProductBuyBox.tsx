"use client";

import { useRef } from "react";
import ProductDetailActions from "@/app/s/[standSlug]/ProductDetailActions";
import { useSectionText } from "@/components/studio/SectionStyleContext";
import type { PublicProductCard } from "@/lib/public-product";
import SalePrice from "@/components/storefront/SalePrice";
import type { PaymentBrand } from "@/lib/payment-brand-assets";
import ProductStickyCart from "./ProductStickyCart";
import ProductPaymentStrip from "./ProductPaymentStrip";
import type { ProductButtons } from "@/lib/studio/product-buttons";

/** Options, quantity and Add to cart, plus the phone sticky bar that mirrors them. */
export default function ProductBuyBox({
  standSlug,
  currency,
  product,
  catalogProducts,
  stickyCart,
  paymentBrands,
  buttons = "both",
  buttonWidth = null,
}: {
  standSlug: string;
  currency: string;
  product: PublicProductCard;
  catalogProducts: PublicProductCard[];
  stickyCart: boolean;
  paymentBrands: PaymentBrand[];
  buttons?: ProductButtons;
  buttonWidth?: number | null;
}) {
  const actionsRef = useRef<HTMLDivElement>(null);
  const cartLabel = useSectionText("addToCart", "Add to cart");
  const checkoutLabel = useSectionText("addAndCheckout", "Add & checkout");
  const addLabel = buttons === "checkout" ? checkoutLabel : cartLabel;
  return (
    <>
      <div ref={actionsRef} className="mt-8">
        <ProductDetailActions
          standSlug={standSlug}
          currency={currency}
          product={product}
          catalogProducts={catalogProducts}
          buttons={buttons}
          buttonWidth={buttonWidth}
        />
        <ProductPaymentStrip brands={paymentBrands} />
      </div>
      {stickyCart ? (
        <ProductStickyCart
          actionsRef={actionsRef}
          name={product.name}
          price={<SalePrice priceCents={product.priceCents} compareAtPriceCents={product.compareAtPriceCents} currency={currency} />}
          hasOptions={product.hasOptions}
          soldOut={product.soldOut}
          addLabel={addLabel}
        />
      ) : null}
    </>
  );
}
