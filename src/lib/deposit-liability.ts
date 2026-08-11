/** Soft cap on outstanding deposit principal per owner (AUD-equivalent cents). */
export function depositOutstandingCapCents(): number {
  const raw = process.env.VENDL_DEPOSIT_OUTSTANDING_CAP_CENTS;
  if (raw && /^\d+$/.test(raw)) return Number(raw);
  return 500_000; // A$5,000
}
