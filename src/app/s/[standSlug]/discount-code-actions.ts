"use server";

import { loadStandCart, type CartItemInput } from "@/lib/checkout";
import type { DiscountChannel } from "@/lib/discounts/resolve-code";
import { normalizeReceiptEmail } from "@/lib/first-order-discount";

export type DiscountPreview = {
  code: string;
  discountCents: number;
  freeShipping: boolean;
};

export async function previewDiscountCode(input: {
  standSlug: string;
  items: CartItemInput[];
  code: string;
  email?: string;
  channel: DiscountChannel;
}): Promise<DiscountPreview | { error: string }> {
  try {
    const email = input.email ? normalizeReceiptEmail(input.email) : "";
    const loaded = await loadStandCart(input.standSlug, input.items, {
      receiptEmail: email || null,
      claimFirstOrder: false,
      couponCode: input.code,
      channel: input.channel,
      codePreview: true,
    });
    if ("error" in loaded) return { error: loaded.error ?? "Could not check that code." };
    if (!loaded.promotionCode) return { error: "That discount code isn't valid." };
    return {
      code: loaded.promotionCode,
      discountCents: loaded.discountCents,
      freeShipping: loaded.freeShipping,
    };
  } catch (e) {
    console.error("[previewDiscountCode]", e);
    return { error: "Could not check that code. Try again." };
  }
}
