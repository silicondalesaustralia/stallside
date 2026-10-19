"use client";

import { useState } from "react";
import type { CartItemInput } from "@/lib/checkout";
import type { DiscountChannel } from "@/lib/discounts/resolve-code";
import { previewDiscountCode, type DiscountPreview } from "./discount-code-actions";

/** Applied code for the current cart; a changed cart drops the code so it's re-checked. */
export function useCartDiscount(input: {
  standSlug: string;
  items: CartItemInput[];
  email: string;
  channel: DiscountChannel | null;
}) {
  const key = JSON.stringify(input.items);
  const [saved, setSaved] = useState<{ preview: DiscountPreview; key: string } | null>(null);
  const applied = saved && saved.key === key ? saved.preview : null;

  return {
    applied,
    couponCode: applied?.code ?? null,
    check: (code: string) =>
      previewDiscountCode({
        standSlug: input.standSlug,
        items: input.items,
        code,
        email: input.email.trim() || undefined,
        channel: input.channel ?? "website",
      }),
    onApplied: (preview: DiscountPreview | null) =>
      setSaved(preview ? { preview, key } : null),
  };
}
