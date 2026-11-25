/** Short notes under Stripe checkout method toggles. */
export default function BnplExplainer({
  isPro,
  showPayTo = false,
}: {
  isPro: boolean;
  showPayTo?: boolean;
}) {
  return (
    <div className="space-y-1 text-[var(--muted)]">
      <p>
        Pay-later (Zip, Klarna, Afterpay) usually needs about $30+ and never
        shows on pre-orders.
        {showPayTo
          ? " PayTo can take a moment to clear before the sale is marked paid."
          : ""}{" "}
        Providers charge higher fees than cards
        {isPro ? "; Pro has no Vendl fee." : "; Free still adds the 2.5% Vendl fee."}
      </p>
    </div>
  );
}
