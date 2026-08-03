type BillingNoticesProps = {
  freeForever: boolean;
  locked: boolean;
  success: boolean;
  cancelled: boolean;
  cancelling: boolean;
  cancelUntilLabel: string | null;
};

export default function BillingNotices({
  freeForever,
  success,
  cancelled,
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
      {success ? (
        <p className="text-sm text-[var(--leaf-dark)]">
          Pro subscription started. Status updates within a few seconds.
        </p>
      ) : null}
      {cancelled ? (
        <p className="text-sm text-[var(--muted)]">Checkout cancelled.</p>
      ) : null}
      {cancelling && cancelUntilLabel ? (
        <p className="text-sm text-[var(--muted)]">
          Cancellation scheduled. You keep Pro until {cancelUntilLabel}, then
          return to Free. Your data stays.
        </p>
      ) : null}
    </>
  );
}
