import LpStartFreeLink from "@/components/lp/LpStartFreeLink";
import {
  GOLD_CTA_CLASS,
  HOME_PRODUCERS_COPY,
  HOME_PRODUCERS_SIGNUP_HREF,
} from "@/lib/home-producers-lp";

export default function FreeAccountOffer() {
  return (
    <section
      id="lp-final-cta"
      className="bg-[var(--wash)] px-5 py-14 text-center sm:px-8 lg:py-20"
    >
      <div className="mx-auto max-w-2xl">
        <p className="text-sm font-semibold text-[var(--leaf-dark)] sm:text-base">
          {HOME_PRODUCERS_COPY.freePriceLabel}
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-[1.75rem] font-bold leading-[1.1] tracking-tight text-[var(--field)] sm:text-[2.5rem]">
          Get your next collection ready to sell.
        </h2>
        <p className="mt-3 text-base text-[var(--muted)] sm:text-lg">
          Your shop, pre-orders, subscriptions and order tools. All included.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <LpStartFreeLink
            placement="final"
            label={HOME_PRODUCERS_COPY.ctaLabel}
            href={HOME_PRODUCERS_SIGNUP_HREF}
            className={GOLD_CTA_CLASS}
          />
        </div>
      </div>
    </section>
  );
}
