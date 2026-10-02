/** Format cents for Square PaymentRequest total.amount (display string). */
export function squarePaymentRequestAmount(amountCents: number): string {
  return (Math.max(0, amountCents) / 100).toFixed(2);
}

export function buildSquarePaymentRequestOptions(input: {
  countryCode: string;
  currencyCode: string;
  amountCents: number;
  label?: string;
}) {
  return {
    countryCode: input.countryCode,
    currencyCode: input.currencyCode.toUpperCase(),
    total: {
      amount: squarePaymentRequestAmount(input.amountCents),
      label: input.label ?? "Total",
    },
  };
}
