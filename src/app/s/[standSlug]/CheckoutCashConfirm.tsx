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
      <p className="text-lg text-[var(--muted)]">Please make your cash payment of</p>
      <p className="font-receipt text-5xl font-semibold tracking-tight">{amountLabel}</p>
      <p className="text-lg leading-snug text-[var(--muted)]">
        in the slot, cash box or whatever is provided. Then tap below so we can update the
        stand&apos;s stock.
      </p>
      <button
        type="button"
        disabled={pending}
        onClick={onConfirm}
        className="w-full rounded-[var(--radius-pill)] bg-[var(--leaf)] px-5 py-4 text-xl font-semibold text-white disabled:opacity-50"
      >
        {pending ? "Logging…" : "I have paid cash"}
      </button>
      <button
        type="button"
        onClick={onBack}
        className="w-full rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] px-5 py-4 text-lg font-semibold text-[var(--ink)]"
      >
        Back
      </button>
    </div>
  );
}
