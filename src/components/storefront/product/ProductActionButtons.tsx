"use client";

import SectionCopy from "@/components/studio/SectionCopy";
import { useSectionCopyContext, useSectionText } from "@/components/studio/SectionStyleContext";
import type { ProductButtons } from "@/lib/studio/product-buttons";

/** Site-wide button shape, size and text size apply; the section's Button settings override them. */
const BASE = "studio-btn w-full py-2 text-center";
const CART = `${BASE} studio-btn--secondary`;
const CHECKOUT = `${BASE} studio-btn--primary`;

/**
 * Add to cart and/or Add & checkout. `data-product-add` marks the first visible one so the
 * phone sticky bar presses the right button. In the builder the labels are edited in place.
 */
export default function ProductActionButtons({
  buttons = "both",
  width = null,
  disabled,
  onAdd,
}: {
  buttons?: ProductButtons;
  /** Percent of the column; null keeps the standard width. */
  width?: number | null;
  disabled: boolean;
  onAdd: (goCart: boolean) => void;
}) {
  const { editable } = useSectionCopyContext();
  const addLabel = useSectionText("addToCart", "Add to cart");
  const checkoutLabel = useSectionText("addAndCheckout", "Add & checkout");
  const showCart = buttons !== "checkout";
  const showCheckout = buttons !== "cart";

  return (
    <div
      className={`mx-auto flex flex-col items-stretch gap-2 ${width == null ? "w-full max-w-xs" : "min-w-[min(100%,12rem)]"}`}
      style={width == null ? undefined : { width: `${width}%` }}
    >
      {editable ? (
        <>
          {showCart ? (
            <div className={CART}>
              <SectionCopy k="addToCart" fallback="Add to cart" />
            </div>
          ) : null}
          {showCheckout ? (
            <div className={CHECKOUT}>
              <SectionCopy k="addAndCheckout" fallback="Add & checkout" />
            </div>
          ) : null}
        </>
      ) : (
        <>
          {showCart ? (
            <button type="button" disabled={disabled} onClick={() => onAdd(false)} data-product-add className={`${CART} disabled:opacity-40`}>
              {addLabel}
            </button>
          ) : null}
          {showCheckout ? (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onAdd(true)}
              {...(showCart ? {} : { "data-product-add": "" })}
              className={`${CHECKOUT} disabled:opacity-40`}
            >
              {checkoutLabel}
            </button>
          ) : null}
        </>
      )}
    </div>
  );
}
