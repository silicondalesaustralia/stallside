/** 1250 → "12.50" for a price text field. */
export function centsToInput(cents: number | null): string {
  return cents == null ? "" : (cents / 100).toFixed(2);
}

/** "$12.5" → 1250; null when it isn't a valid amount. */
export function inputToCents(text: string): number | null {
  const cleaned = text.replace(/[$,\s]/g, "");
  if (!/^\d+(\.\d{0,2})?$/.test(cleaned)) return null;
  return Math.round(Number(cleaned) * 100);
}
