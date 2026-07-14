import BrandMark from "@/components/BrandMark";

type CashConfirmMockProps = {
  compact?: boolean;
};

export default function CashConfirmMock({ compact = false }: CashConfirmMockProps) {
  if (compact) {
    return (
      <div className="hero-phone mt-6 flex items-center gap-3 rounded-2xl border border-[var(--ink-on-dark)]/20 bg-[var(--panel)]/95 px-4 py-3 text-[var(--ink)]">
        <BrandMark className="size-8 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-[var(--muted)]">Cash confirmed</p>
          <p className="font-receipt text-lg font-semibold text-[var(--field)]">$12.00</p>
        </div>
        <p className="shrink-0 text-[10px] font-semibold text-[var(--leaf)]">Owner alerted</p>
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-[240px] lg:mx-0 lg:ml-auto lg:max-w-[260px]">
      <div
        aria-hidden
        className="hero-bracket absolute -bottom-2 -right-2 size-12 border-b-[3px] border-r-[3px] border-[var(--ink-on-dark)]/45 sm:size-14"
        style={{ borderBottomRightRadius: 10 }}
      />
      <div className="hero-phone relative rounded-[28px] border-[5px] border-[var(--ink-on-dark)]/90 bg-[var(--panel)] p-2.5 shadow-[0_20px_50px_rgb(0_0_0/0.4)]">
        <div className="rounded-[20px] bg-[var(--wash)] px-3 py-4 text-[var(--ink)]">
          <div className="flex items-center gap-2">
            <BrandMark className="size-6" />
            <p className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-tight">
              Gate stall
            </p>
          </div>
          <p className="mt-4 text-center text-[11px] text-[var(--muted)]">
            Slot, cash box, or whatever is provided
          </p>
          <p className="mt-1 text-center font-receipt text-3xl font-semibold text-[var(--field)]">
            $12.00
          </p>
          <p className="mt-4 rounded-[var(--radius-pill)] bg-[var(--leaf)] py-2.5 text-center text-[11px] font-semibold text-white">
            I have paid cash ✓
          </p>
          <p className="mt-2 text-center text-[10px] font-medium text-[var(--field)]">
            Confirmed - owner alerted
          </p>
        </div>
      </div>
    </div>
  );
}
