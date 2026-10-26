/** One captured provider payment on an order (deposit, balance, or the only payment). */
export type PaymentState = {
  id: string;
  amountCents: number;
  refundedCents: number;
  /** Vendl application fee on this payment (Square only; Stripe refunds its fee itself). */
  appFeeCents: number;
};

export function remainingCents(payment: PaymentState): number {
  return Math.max(0, payment.amountCents - payment.refundedCents);
}

/** Fee share returned to the seller for refunding `amountCents` of `payment`. */
export function proportionalAppFee(payment: PaymentState, amountCents: number): number {
  if (payment.appFeeCents <= 0 || payment.amountCents <= 0) return 0;
  return Math.min(
    payment.appFeeCents,
    Math.round((payment.appFeeCents * amountCents) / payment.amountCents),
  );
}

/** Split a refund across payments, newest (balance) first. */
export function allocateRefund(
  payments: PaymentState[],
  amountCents: number,
): { payment: PaymentState; amountCents: number }[] {
  const plan: { payment: PaymentState; amountCents: number }[] = [];
  let left = amountCents;
  for (const payment of [...payments].reverse()) {
    if (left <= 0) break;
    const take = Math.min(left, remainingCents(payment));
    if (take > 0) plan.push({ payment, amountCents: take });
    left -= take;
  }
  return plan;
}
