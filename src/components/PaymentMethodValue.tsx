/** Cash vs card/PayPal checkout icons for payment-method stats. */
export function CashMethodIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4 shrink-0 sm:size-5"
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
      className="size-4 shrink-0 sm:size-5"
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
  cashOrderCount,
  checkoutOrderCount,
}: {
  cashOrderCount: number;
  checkoutOrderCount: number;
}) {
  if (cashOrderCount === 0 && checkoutOrderCount === 0) {
    return <span className="text-[var(--muted)]">—</span>;
  }

  return (
    <span className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-sans text-sm font-semibold tracking-normal sm:text-base">
      <span className="inline-flex items-center gap-1.5 text-[var(--field)]">
        <CashMethodIcon />
        <span>
          Cash{" "}
          <span className="font-receipt tabular-nums">{cashOrderCount}</span>
        </span>
      </span>
      <span className="inline-flex items-center gap-1.5 text-[var(--field)]">
        <CheckoutMethodIcon />
        <span>
          Checkout{" "}
          <span className="font-receipt tabular-nums">
            {checkoutOrderCount}
          </span>
        </span>
      </span>
    </span>
  );
}
