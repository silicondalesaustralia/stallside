"use client";

type CheckoutPayStepProps = {
  cardEnabled: boolean;
  pending: boolean;
  onCash: () => void;
  onCard: () => void;
  onBack: () => void;
};

export default function CheckoutPayStep({
  cardEnabled,
  pending,
  onCash,
  onCard,
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
          <p className="mt-2 text-lg leading-snug text-[var(--muted)]">
            Let the owner know you&apos;d use Tap &amp; Go if it was available.
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
