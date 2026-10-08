/** Client-safe deposit maths shared by checkout and the cart summary. */
export function splitDepositBalance(
  totalCents: number,
  depositPercent: number,
): { depositCents: number; balanceCents: number } {
  const pct = Math.min(99, Math.max(1, Math.round(depositPercent)));
  const depositCents = Math.max(1, Math.round((totalCents * pct) / 100));
  const balanceCents = Math.max(0, totalCents - depositCents);
  return { depositCents, balanceCents };
}
