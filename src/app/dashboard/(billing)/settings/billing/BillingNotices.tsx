type BillingNoticesProps = {
  freeForever: boolean;
  locked: boolean;
  trialEnded: boolean;
  success: boolean;
  cancelled: boolean;
  trialActive: boolean;
  trialEndsLabel: string | null;
  cancelling: boolean;
  cancelUntilLabel: string | null;
};

export default function BillingNotices({
  freeForever,
  locked,
  trialEnded,
  success,
  cancelled,
  trialActive,
  trialEndsLabel,
  cancelling,
  cancelUntilLabel,
}: BillingNoticesProps) {
  return (
    <>
      {freeForever ? (
        <p className="rounded-xl border border-[var(--leaf)]/30 bg-[var(--leaf)]/10 px-4 py-3 text-sm">
          Complimentary access — full dashboard forever, no subscription required.
        </p>
      ) : null}
      {!freeForever && locked ? (
        <p className="rounded-xl border border-[var(--marigold)]/40 bg-[var(--marigold)]/10 px-4 py-3 text-sm">
          Your subscription is not active. Stands, products, inventory, and orders
          stay saved. Subscribe again to reopen the app.
        </p>
      ) : null}
      {trialEnded ? (
        <p className="text-sm text-[var(--muted)]">Your free trial has ended.</p>
      ) : null}
      {success ? (
        <p className="text-sm text-[var(--leaf-dark)]">
          Subscription started. Status updates within a few seconds.
        </p>
      ) : null}
      {cancelled ? (
        <p className="text-sm text-[var(--muted)]">Checkout cancelled.</p>
      ) : null}
      {trialActive && trialEndsLabel ? (
        <p className="text-sm text-[var(--leaf-dark)]">
          Cash free trial active until {trialEndsLabel}.
        </p>
      ) : null}
      {cancelling && cancelUntilLabel ? (
        <p className="text-sm text-[var(--muted)]">
          Cancellation scheduled. You keep full access until {cancelUntilLabel}.
          Resubscribe anytime. Your data stays.
        </p>
      ) : null}
    </>
  );
}
