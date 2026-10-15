/** Which buy buttons the product page shows; there is always at least one. */
export const PRODUCT_BUTTONS = ["both", "cart", "checkout"] as const;
export type ProductButtons = (typeof PRODUCT_BUTTONS)[number];

/** Button width as a percent of the details column; unset keeps the standard width. */
export const BUTTON_WIDTH_MIN = 30;
export const BUTTON_WIDTH_MAX = 100;
export const BUTTON_WIDTH_STANDARD = 70;

export function productButtonsOf(value: unknown): ProductButtons {
  return PRODUCT_BUTTONS.includes(value as ProductButtons) ? (value as ProductButtons) : "both";
}

export function buttonWidthOf(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return Math.min(BUTTON_WIDTH_MAX, Math.max(BUTTON_WIDTH_MIN, Math.round(value)));
}

/** Turning one button off keeps the other on; the last one can't be switched off. */
export function toggleProductButton(current: ProductButtons, button: "cart" | "checkout", on: boolean): ProductButtons {
  const cart = button === "cart" ? on : current !== "checkout";
  const checkout = button === "checkout" ? on : current !== "cart";
  if (cart && checkout) return "both";
  if (cart) return "cart";
  if (checkout) return "checkout";
  return current;
}
