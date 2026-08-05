import LpStartFreeLink from "@/components/lp/LpStartFreeLink";

export default function LpClosingCta() {
  return (
    <section
      id="lp-final-cta"
      className="bg-[var(--field)] px-5 py-14 text-center text-[var(--ink-on-dark)] sm:px-6 sm:py-20"
    >
      <div className="mx-auto max-w-2xl">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight sm:text-4xl">
          Your stall, minus the missed sales.
        </h2>
        <p className="mt-3 text-base text-[var(--ink-on-dark)]/85 sm:text-lg">
          Set up your QR checkout in minutes and give every customer a way to
          pay.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <LpStartFreeLink
            placement="final"
            className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-pill)] bg-[var(--marigold)] px-6 py-3 text-base font-semibold text-[var(--field)] transition hover:brightness-105"
          />
          <p className="text-sm text-[var(--ink-on-dark)]/70">
            A$0 monthly on Free · No terminal · No card details
          </p>
        </div>
      </div>
    </section>
  );
}
