import LpStartFreeLink from "@/components/lp/LpStartFreeLink";

export default function LpClosingCta() {
  return (
    <section className="mx-auto w-full max-w-3xl px-5 py-12 text-center sm:px-6 sm:py-16">
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-[var(--field)] sm:text-3xl">
        Your stall, minus the missed sales.
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-base text-[var(--muted)] sm:text-lg">
        Free to start. No monthly fee. No hardware.
      </p>
      <div className="mt-7">
        <LpStartFreeLink />
      </div>
    </section>
  );
}
