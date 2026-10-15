"use client";

import SectionCopy from "./SectionCopy";
import { useSectionCopyContext } from "./SectionStyleContext";
import type { ProductButtons } from "@/lib/studio/product-buttons";

const CHIP = "rounded-full border border-[var(--line)] bg-[var(--panel)] px-2.5 py-0.5 font-semibold text-[var(--field)]";

/** Builder-only row for renaming the add-to-cart buttons, which may be disabled in the preview. */
export default function CartButtonLabels({ buttons = "both" }: { buttons?: ProductButtons }) {
  const { editable } = useSectionCopyContext();
  if (!editable) return null;
  return (
    <div className="mt-6 flex flex-wrap items-center gap-2 rounded-md border border-dashed border-[var(--line)] px-3 py-2 text-xs text-[var(--muted)]">
      <span>Button labels:</span>
      {buttons !== "checkout" ? <SectionCopy k="addToCart" fallback="Add to cart" className={CHIP} /> : null}
      {buttons !== "cart" ? <SectionCopy k="addAndCheckout" fallback="Add & checkout" className={CHIP} /> : null}
    </div>
  );
}
