/** Yellow tip for Stripe test card on public demo checkout. */
export default function DemoCardHint() {
  return (
    <p className="rounded-[var(--radius)] border border-[var(--marigold)]/50 bg-[var(--marigold)]/15 px-4 py-3 text-sm leading-snug text-[var(--ink)]">
      If you choose pay by card, use card number{" "}
      <span className="font-receipt font-semibold">4242 4242 4242 4242</span>, any
      future expiry, and any 3-digit CVV to complete the demo checkout.
    </p>
  );
}
