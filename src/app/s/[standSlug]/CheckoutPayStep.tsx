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
      <p className="text-base font-semibold">How would you like to pay?</p>
      <button
        type="button"
        disabled={pending}
        onClick={onCash}
        className="rounded-[var(--radius)] bg-[var(--leaf)] px-4 py-5 text-left text-base font-semibold text-white"
      >
        Pay cash
      </button>
      {cardEnabled ? (
        <button
          type="button"
          disabled={pending}
          onClick={onCard}
          className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] px-4 py-5 text-left text-base font-semibold disabled:opacity-50"
        >
          {pending ? "Opening checkout…" : "Tap & Go - card, Apple Pay, Google Pay"}
        </button>
      ) : (
        <div className="rounded-[var(--radius)] border border-dashed border-[var(--line)] bg-[var(--panel)] px-4 py-5">
          <p className="text-base font-semibold text-[var(--muted)]">
            Tap &amp; Go not active at this stand
          </p>
          <p className="mt-2 text-base leading-snug text-[var(--muted)]">
            Let the owner know you&apos;d use Tap &amp; Go if it was available.
          </p>
        </div>
      )}
      <button
        type="button"
        className="pt-1 text-base font-medium text-[var(--leaf-dark)] underline"
        onClick={onBack}
      >
        Back to cart
      </button>
    </div>
  );
}
