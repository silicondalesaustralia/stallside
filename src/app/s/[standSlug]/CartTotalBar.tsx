import SectionCopy from "@/components/studio/SectionCopy";

/** Total + "Continue to payment"; fixed to the bottom of the screen unless `inline` (builder preview). */
export default function CartTotalBar({
  totalLabel,
  disabled,
  onContinue,
  inline = false,
}: {
  totalLabel: string;
  disabled: boolean;
  onContinue: () => void;
  inline?: boolean;
}) {
  const frame = inline
    ? "rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-4"
    : "fixed inset-x-0 bottom-0 z-20 border-t border-[var(--line)] bg-[var(--panel)]/95 px-4 py-4 backdrop-blur pb-[max(1rem,env(safe-area-inset-bottom))]";
  return (
    <div className={frame}>
      <div className="mx-auto flex max-w-lg flex-col gap-3">
        <div className="flex items-baseline justify-between gap-3">
          <SectionCopy k="total" fallback="Total" as="p" className="block text-base text-[var(--muted)]" />
          <p className="font-receipt text-3xl font-semibold tabular-nums">{totalLabel}</p>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={onContinue}
          className="w-full rounded-[var(--radius-pill)] bg-[var(--leaf)] px-6 py-4 text-lg font-semibold text-white disabled:opacity-50"
        >
          <SectionCopy k="continue" fallback="Continue to payment" />
        </button>
      </div>
    </div>
  );
}
