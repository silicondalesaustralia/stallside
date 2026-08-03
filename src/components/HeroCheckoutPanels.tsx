import PaymentIconRow from "@/components/PaymentIconRow";

export function HeroPickPanel() {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-2.5 sm:p-3.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
        1. Pick
      </p>
      <div className="mt-2 flex items-center gap-2 sm:gap-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/dozen-eggs.png"
          alt=""
          width={40}
          height={40}
          className="size-8 shrink-0 object-contain sm:size-10"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">Dozen eggs</p>
          <p className="mt-0.5 font-receipt text-xs text-[var(--muted)]">
            $6.00 each
          </p>
        </div>
        <p className="shrink-0 rounded-full border border-[var(--line)] bg-[var(--wash)] px-2 py-0.5 font-receipt text-sm font-semibold sm:px-2.5 sm:py-1">
          ×2
        </p>
      </div>
      <div className="mt-2 flex items-center justify-between border-t border-[var(--line)] pt-2 sm:mt-3">
        <p className="text-xs text-[var(--muted)]">Total</p>
        <p className="font-receipt text-base font-semibold text-[var(--field)] sm:text-lg">
          $12.00
        </p>
      </div>
    </div>
  );
}

export function HeroCashPayPanel() {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-2.5 sm:p-3.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
        2. Pay cash
      </p>
      <p className="mt-1.5 text-center text-[11px] leading-snug text-[var(--muted)] sm:mt-2">
        Slot, cash box, or whatever is provided
      </p>
      <p className="mt-1 text-center font-receipt text-xl font-semibold text-[var(--field)] sm:text-2xl">
        $12.00
      </p>
      <p className="mt-2 rounded-[var(--radius-pill)] bg-[var(--leaf)] py-2 text-center text-[11px] font-semibold text-white sm:py-2.5">
        I have paid cash ✓
      </p>
      <p className="mt-1.5 text-center text-[10px] font-medium text-[var(--field)]">
        Confirmed - owner alerted
      </p>
    </div>
  );
}

export function HeroCardPayPanel() {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-2.5 sm:p-3.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
        2. Pay card
      </p>
      <p className="mt-1.5 text-center text-[11px] leading-snug text-[var(--muted)] sm:mt-2">
        Card, Apple Pay, Google Pay
      </p>
      <div className="mt-1.5 flex justify-center text-[var(--ink)]">
        <PaymentIconRow
          brands={["card", "apple", "google"]}
          className="justify-center gap-2"
        />
      </div>
      <p className="mt-1.5 text-center font-receipt text-xl font-semibold text-[var(--field)] sm:text-2xl">
        $12.00
      </p>
      <p className="mt-2 rounded-[var(--radius-pill)] bg-[var(--field)] py-2 text-center text-[11px] font-semibold text-white sm:py-2.5">
        Pay $12.00 ✓
      </p>
      <p className="mt-1.5 text-center text-[10px] font-medium text-[var(--field)]">
        Paid - owner alerted
      </p>
    </div>
  );
}
