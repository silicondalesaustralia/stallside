"use client";

type CheckoutPayStepProps = {
  cardEnabled: boolean;
  paypalEnabled: boolean;
  pending: boolean;
  onCash: () => void;
  onCard: () => void;
  onPayPal: () => void;
  onBack: () => void;
};

export default function CheckoutPayStep({
  cardEnabled,
  paypalEnabled,
  pending,
  onCash,
  onCard,
  onPayPal,
  onBack,
}: CheckoutPayStepProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xl font-semibold">How would you like to pay?</p>
      <button
        type="button"
        disabled={pending}
        onClick={onCash}
        className="rounded-[var(--radius)] bg-[var(--leaf)] px-5 py-5 text-left text-xl font-semibold text-white disabled:opacity-50"
      >
        Pay cash
      </button>
      {cardEnabled ? (
        <button
          type="button"
          disabled={pending}
          onClick={onCard}
          className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] px-5 py-5 text-left text-xl font-semibold disabled:opacity-50"
        >
          {pending ? "Opening checkout…" : "Tap & Go - card, Apple Pay, Google Pay"}
        </button>
      ) : (
        <div className="rounded-[var(--radius)] border border-dashed border-[var(--line)] bg-[var(--panel)] px-5 py-5">
          <p className="text-lg font-semibold text-[var(--muted)]">
            Tap &amp; Go not active at this stand
          </p>
        </div>
      )}
      {paypalEnabled ? (
        <button
          type="button"
          disabled={pending}
          onClick={onPayPal}
          className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] px-5 py-5 text-left text-xl font-semibold disabled:opacity-50"
        >
          {pending ? "Opening PayPal…" : "Pay with PayPal"}
        </button>
      ) : (
        <div className="rounded-[var(--radius)] border border-dashed border-[var(--line)] bg-[var(--panel)] px-5 py-5">
          <p className="text-lg font-semibold text-[var(--muted)]">
            PayPal not active at this stand
          </p>
        </div>
      )}
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
