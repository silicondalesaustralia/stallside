import BrandMark from "@/components/BrandMark";

/** Desktop hero demo: pick items → cash confirm, one panel. */
export default function HeroCheckoutDemo() {
  return (
    <div className="hero-phone relative w-full max-w-xl lg:max-w-none">
      <div
        aria-hidden
        className="hero-bracket absolute -bottom-2 -right-2 size-12 border-b-[3px] border-r-[3px] border-[var(--ink-on-dark)]/45 sm:size-14"
        style={{ borderBottomRightRadius: 10 }}
      />
      <div className="relative overflow-hidden rounded-[24px] border-[5px] border-[var(--ink-on-dark)]/90 bg-[var(--panel)] shadow-[0_20px_50px_rgb(0_0_0/0.4)]">
        <div className="bg-[var(--wash)] px-4 py-4 text-[var(--ink)] sm:px-5 sm:py-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BrandMark className="size-7" />
              <p className="font-[family-name:var(--font-display)] text-base font-semibold tracking-tight">
                Gate stall
              </p>
            </div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">
              Example
            </p>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 sm:gap-5">
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                1. Pick
              </p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Dozen eggs</p>
                  <p className="mt-0.5 font-receipt text-xs text-[var(--muted)]">$6.00 each</p>
                </div>
                <p className="rounded-full border border-[var(--line)] bg-[var(--wash)] px-3 py-1 font-receipt text-sm font-semibold">
                  ×2
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-[var(--line)] pt-3">
                <p className="text-xs text-[var(--muted)]">Total</p>
                <p className="font-receipt text-lg font-semibold text-[var(--field)]">$12.00</p>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                2. Pay cash
              </p>
              <p className="mt-3 text-center text-[11px] leading-snug text-[var(--muted)]">
                Slot, cash box, or whatever is provided
              </p>
              <p className="mt-1 text-center font-receipt text-3xl font-semibold text-[var(--field)]">
                $12.00
              </p>
              <p className="mt-3 rounded-[var(--radius-pill)] bg-[var(--leaf)] py-2.5 text-center text-[11px] font-semibold text-white">
                I have paid cash ✓
              </p>
              <p className="mt-2 text-center text-[10px] font-medium text-[var(--field)]">
                Confirmed - owner alerted
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
