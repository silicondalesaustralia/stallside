"use client";

type CheckoutCashConfirmProps = {
  amountLabel: string;
  pending: boolean;
  onConfirm: () => void;
  onBack: () => void;
};

export default function CheckoutCashConfirm({
  amountLabel,
  pending,
  onConfirm,
  onBack,
}: CheckoutCashConfirmProps) {
  return (
    <div className="flex flex-col gap-4 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-5">
      <p className="text-base text-[var(--muted)]">Please place</p>
      <p className="font-receipt text-4xl font-semibold tracking-tight">{amountLabel}</p>
      <p className="text-base leading-snug text-[var(--muted)]">
        in the cash slot. Once you have placed the cash in the slot, tap below so we can update
        the stand&apos;s stock.
      </p>
      <button
        type="button"
        disabled={pending}
        onClick={onConfirm}
        className="rounded-[var(--radius-pill)] bg-[var(--leaf)] px-4 py-3.5 text-base font-semibold text-white disabled:opacity-50"
      >
        {pending ? "Logging…" : "I have paid cash"}
      </button>
      <button
        type="button"
        className="text-base font-medium text-[var(--leaf-dark)] underline"
        onClick={onBack}
      >
        Back
      </button>
    </div>
  );
}
