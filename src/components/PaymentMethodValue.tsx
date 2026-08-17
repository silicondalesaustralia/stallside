/** Cash vs card/PayPal checkout icons for payment-method stats. */
export function CashMethodIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function CheckoutMethodIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18" />
      <path d="M7 15h2" />
    </svg>
  );
}

export default function PaymentMethodValue({
  hasCash,
  hasCheckout,
}: {
  hasCash: boolean;
  hasCheckout: boolean;
}) {
  if (!hasCash && !hasCheckout) {
    return <span className="text-[var(--muted)]">—</span>;
  }

  return (
    <span className="inline-flex flex-wrap items-center justify-center gap-3 font-sans text-base font-semibold tracking-normal sm:text-lg">
      {hasCash ? (
        <span className="inline-flex items-center gap-1.5 text-[var(--field)]">
          <CashMethodIcon />
          <span>Cash</span>
        </span>
      ) : null}
      {hasCheckout ? (
        <span className="inline-flex items-center gap-1.5 text-[var(--field)]">
          <CheckoutMethodIcon />
          <span>Checkout</span>
        </span>
      ) : null}
    </span>
  );
}
