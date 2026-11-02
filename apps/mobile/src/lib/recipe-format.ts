/** "12.5" → 12.5; null when blank, negative or not a number. */
export function parseQuantity(text: string): number | null {
  const trimmed = text.trim().replace(",", ".");
  if (trimmed === "") return null;
  const value = Number(trimmed);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

/** Margin like the web: one decimal place, "—" when unknown. */
export function formatPercent(value: number | null): string {
  return value == null ? "—" : `${value.toFixed(1)}%`;
}
