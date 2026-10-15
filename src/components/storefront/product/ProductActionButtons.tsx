"use client";

import { useSectionText } from "@/components/studio/SectionStyleContext";
import type { ProductButtons } from "@/lib/studio/product-buttons";

const BASE = "w-full rounded-[var(--radius-pill)] px-5 py-3 text-base font-semibold disabled:opacity-40";

/**
 * Add to cart and/or Add & checkout. `data-product-add` marks the first visible one so the
 * phone sticky bar presses the right button.
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
  const addLabel = useSectionText("addToCart", "Add to cart");
  const checkoutLabel = useSectionText("addAndCheckout", "Add & checkout");
  const showCart = buttons !== "checkout";
  const showCheckout = buttons !== "cart";

  return (
    <div
      className={`mx-auto flex flex-col items-stretch gap-2 ${width == null ? "w-full max-w-xs" : "min-w-[min(100%,12rem)]"}`}
      style={width == null ? undefined : { width: `${width}%` }}
    >
      {showCart ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onAdd(false)}
          data-product-add
          className={`${BASE} border border-[var(--line)] bg-[var(--panel)]`}
        >
          {addLabel}
        </button>
      ) : null}
      {showCheckout ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onAdd(true)}
          {...(showCart ? {} : { "data-product-add": "" })}
          className={`${BASE} bg-[var(--site-btn-bg,var(--leaf))] text-[var(--site-btn-ink,#fff)]`}
        >
          {checkoutLabel}
        </button>
      ) : null}
    </div>
  );
}
