export function formatMoney(cents: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function dollarsToCents(value: string | number): number {
  const n = typeof value === "string" ? Number.parseFloat(value) : value;
  if (!Number.isFinite(n) || n < 0) {
    throw new Error("Invalid amount");
  }
  return Math.round(n * 100);
}

export function platformFeeCents(orderTotalCents: number, bps: number): number {
  return Math.round((orderTotalCents * bps) / 10_000);
}
