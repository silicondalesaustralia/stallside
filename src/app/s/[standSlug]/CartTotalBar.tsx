import SectionCopy from "@/components/studio/SectionCopy";

/** Total + "Continue to payment"; fixed to the bottom of the screen unless `inline` (builder preview). */
export default function CartTotalBar({
  totalLabel,
  taxNote = null,
  disabled,
  onContinue,
  inline = false,
}: {
  totalLabel: string;
  /** e.g. "Includes sales tax $1.23 (8.25%)" when tax is added on top. */
  taxNote?: string | null;
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
        {taxNote ? <p className="-mt-2 text-right text-sm text-[var(--muted)]">{taxNote}</p> : null}
        <button
          type="button"
          disabled={disabled}
          onClick={onContinue}
          className="w-full rounded-[var(--radius-pill)] bg-[var(--site-btn-bg,var(--leaf))] px-6 py-4 text-lg font-semibold text-[var(--site-btn-ink,#fff)] disabled:opacity-50"
        >
          <SectionCopy k="continue" fallback="Continue to payment" />
        </button>
      </div>
    </div>
  );
}
