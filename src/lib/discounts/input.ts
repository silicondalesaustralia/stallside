import { EMPTY_DISCOUNT_INPUT, discountInput, type DiscountInputValues } from "@/contracts/mobile/discounts";

export const discountSchema = discountInput;

export type DiscountInput = DiscountInputValues;

export const EMPTY_DISCOUNT: DiscountInput = EMPTY_DISCOUNT_INPUT;

export function parseMoneyCents(raw: string): number | null | "invalid" {
  if (!raw) return null;
  const value = Number(raw.replace(/[$,\s]/g, ""));
  return Number.isFinite(value) && value >= 0 && value <= 100000 ? Math.round(value * 100) : "invalid";
}

export function parseCount(raw: string): number | null | "invalid" {
  if (!raw) return null;
  const value = Number(raw);
  return Number.isInteger(value) && value >= 0 ? value : "invalid";
}
