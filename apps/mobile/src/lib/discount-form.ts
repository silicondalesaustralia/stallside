import type { DiscountInputValues, DiscountType } from "@contracts/mobile/discounts";

export type SetDiscountField = <K extends keyof DiscountInputValues>(key: K, value: DiscountInputValues[K]) => void;

export const DISCOUNT_TYPE_OPTIONS = [
  { value: "PERCENT_OFF", label: "% off" },
  { value: "FIXED_OFF", label: "Amount off" },
  { value: "FREE_DELIVERY", label: "Free delivery" },
] as const satisfies readonly { value: DiscountType; label: string }[];

/** Settings the app doesn't edit; shown as a hint so they aren't a surprise. */
export function webOnlySettings(input: DiscountInputValues): string | null {
  const parts: string[] = [];
  if (!input.wholeOrder) parts.push("only applies to some products");
  if (input.startsOn || input.endsOn) parts.push("has start or end dates");
  return parts.length ? `This code ${parts.join(" and ")}. Change those on the web.` : null;
}
