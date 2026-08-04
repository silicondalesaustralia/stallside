import LpHeroVisual from "@/components/lp/LpHeroVisual";
import LpStartFreeLink from "@/components/lp/LpStartFreeLink";

export default function LpHero() {
  return (
    <section className="relative overflow-hidden bg-[var(--panel)] px-5 pb-10 pt-6 sm:px-6 sm:pb-14 sm:pt-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_85%_20%,rgb(46_125_63_/_0.08),transparent_55%)]"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[48%_52%] lg:gap-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--leaf)]">
            Built for unattended stalls
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-[2.4rem] font-bold leading-[1.1] tracking-tight text-[var(--field)] sm:text-5xl lg:text-[clamp(3rem,5vw,4.5rem)]">
            Stop losing sales when customers don&apos;t have cash.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
            Give your stall one QR code so customers can choose what they are
            taking and pay on their phone - even when nobody is there.
          </p>

          <div id="lp-hero-cta" className="mt-7 flex flex-col items-start gap-3">
            <LpStartFreeLink placement="hero" />
            <p className="text-sm text-[var(--muted)]">
              No card details · No terminal · Setup takes minutes
            </p>
            <a
              href="#how-it-works"
              className="text-sm font-semibold text-[var(--leaf-dark)] underline-offset-2 hover:underline"
            >
              See how it works ↓
            </a>
          </div>

          <ul className="mt-6 flex flex-wrap gap-2">
            {["A$0 monthly on Free", "No customer app", "Instant sale alerts"].map(
              (chip) => (
                <li
                  key={chip}
                  className="rounded-[var(--radius-pill)] border border-[var(--line)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ink)] shadow-sm sm:text-sm"
                >
                  {chip}
                </li>
              ),
            )}
          </ul>
        </div>

        <LpHeroVisual />
      </div>
    </section>
  );
}
