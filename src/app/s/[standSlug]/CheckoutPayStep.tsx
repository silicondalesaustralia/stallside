"use client";

type CheckoutPayStepProps = {
  cashEnabled: boolean;
  cardEnabled: boolean;
  paypalEnabled: boolean;
  localTransferLabel: string | null;
  pending: boolean;
  onCash: () => void;
  onLocalTransfer: () => void;
  onCard: () => void;
  onPayPal: () => void;
  onBack: () => void;
};

export default function CheckoutPayStep({
  cashEnabled,
  cardEnabled,
  paypalEnabled,
  localTransferLabel,
  pending,
  onCash,
  onLocalTransfer,
  onCard,
  onPayPal,
  onBack,
}: CheckoutPayStepProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xl font-semibold">How would you like to pay?</p>
      {cashEnabled ? (
        <button
          type="button"
          disabled={pending}
          onClick={onCash}
          className="rounded-[var(--radius)] bg-[var(--leaf)] px-5 py-5 text-left text-xl font-semibold text-white disabled:opacity-50"
        >
          Pay cash
        </button>
      ) : null}
      {localTransferLabel ? (
        <button
          type="button"
          disabled={pending}
          onClick={onLocalTransfer}
          className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] px-5 py-5 text-left text-xl font-semibold disabled:opacity-50"
        >
          {localTransferLabel}
        </button>
      ) : null}
      {cardEnabled ? (
        <button
          type="button"
          disabled={pending}
          onClick={onCard}
          className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] px-5 py-5 text-left text-xl font-semibold disabled:opacity-50"
        >
          {pending ? "Opening checkout…" : "Tap & Go - card, Apple Pay, Google Pay"}
        </button>
      ) : null}
      {paypalEnabled ? (
        <button
          type="button"
          disabled={pending}
          onClick={onPayPal}
          className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] px-5 py-5 text-left text-xl font-semibold disabled:opacity-50"
        >
          {pending ? "Opening PayPal…" : "Pay with PayPal"}
        </button>
      ) : null}
      {!cashEnabled && !localTransferLabel && !cardEnabled && !paypalEnabled ? (
        <p className="rounded-[var(--radius)] border border-dashed border-[var(--line)] bg-[var(--panel)] px-5 py-5 text-lg text-[var(--muted)]">
          No payment methods are available at this stand right now.
        </p>
      ) : null}
      <button
        type="button"
        onClick={onBack}
        className="mt-1 w-full rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] px-5 py-4 text-lg font-semibold text-[var(--ink)]"
      >
        Back to cart
      </button>
    </div>
  );
}
