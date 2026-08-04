import BrandLockup from "@/components/BrandLockup";
import LpStartFreeLink from "@/components/lp/LpStartFreeLink";

export default function LpHero() {
  return (
    <section className="relative overflow-hidden bg-[var(--field)] text-[var(--ink-on-dark)]">
      <div className="mx-auto grid w-full max-w-5xl gap-8 px-5 pb-10 pt-8 sm:px-6 sm:pb-14 sm:pt-10 lg:grid-cols-2 lg:items-center lg:gap-10">
        <div>
          <BrandLockup link={false} variant="dark" size="md" />
          <h1 className="mt-8 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
            Your stall, minus the missed sales.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--ink-on-dark)]/85 sm:text-lg">
            Give your stall its own QR code so customers can pay by card, PayID
            or cash — even when nobody&apos;s there. Free to start, no monthly
            fee.
          </p>
          <div className="mt-7">
            <LpStartFreeLink />
            <p className="mt-3 text-sm text-[var(--ink-on-dark)]/70">
              No card details. No hardware. Prints on an A4 sheet.
            </p>
          </div>
        </div>
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[var(--radius)] sm:aspect-[5/4] lg:aspect-[4/5]">
          {/* Pre-compressed static assets — skip next/image optimizer hop on cold load */}
          <picture>
            <source srcSet="/lp/hero-stall.webp" type="image/webp" />
            <img
              src="/lp/hero-stall.jpg"
              alt="Roadside egg stall with a Stallside QR poster mounted on the front"
              width={640}
              height={853}
              fetchPriority="high"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </picture>
        </div>
      </div>
    </section>
  );
}
