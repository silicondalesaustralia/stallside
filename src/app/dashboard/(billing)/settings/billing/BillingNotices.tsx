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
          Complimentary access - full Pro forever, no subscription required.
        </p>
      ) : null}
      {trialEnded ? (
        <p className="rounded-xl border border-[var(--line)] bg-[var(--wash)] px-4 py-3 text-sm">
          You&apos;re on <strong>Starter</strong> (free forever). Nothing&apos;s
          lost - upgrade to Pro anytime for Tap &amp; Go, pre-orders, branding,
          and restock emails.
        </p>
      ) : null}
      {success ? (
        <p className="text-sm text-[var(--leaf-dark)]">
          Pro subscription started. Status updates within a few seconds.
        </p>
      ) : null}
      {cancelled ? (
        <p className="text-sm text-[var(--muted)]">Checkout cancelled.</p>
      ) : null}
      {trialActive && trialEndsLabel ? (
        <p className="text-sm text-[var(--leaf-dark)]">
          Pro free trial active until {trialEndsLabel}. After that you stay on
          Starter (free forever) unless you upgrade.
        </p>
      ) : null}
      {cancelling && cancelUntilLabel ? (
        <p className="text-sm text-[var(--muted)]">
          Cancellation scheduled. You keep Pro until {cancelUntilLabel}, then
          return to Starter. Your data stays.
        </p>
      ) : null}
    </>
  );
}
