import Image from "next/image";
import CampaignHeader from "@/components/lp/home-producers/CampaignHeader";
import HeroExampleCard from "@/components/lp/home-producers/HeroExampleCard";
import LpStartFreeLink from "@/components/lp/LpStartFreeLink";
import {
  GOLD_CTA_CLASS,
  HOME_PRODUCERS_COPY,
  HOME_PRODUCERS_SIGNUP_HREF,
} from "@/lib/home-producers-lp";

export default function HomeProducerHero() {
  return (
    <section className="relative isolate overflow-hidden bg-[var(--field)] text-[var(--ink-on-dark)] lg:min-h-[600px]">
      <CampaignHeader />

      <div className="relative z-10 mx-auto max-w-6xl px-5 pb-10 pt-4 sm:px-8 lg:pb-24 lg:pt-12">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--ink-on-dark)]/85 sm:text-sm">
            For home producers, growers &amp; farm stands
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-[2.25rem] font-bold leading-[1.06] tracking-tight text-white lg:text-[3.5rem]">
            Make <span className="text-[var(--marigold)]">more money</span> from what you
            bake, grow or make.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[var(--ink-on-dark)]/90 sm:text-lg">
            Take pre-orders, offer extras and turn regular customers into regular orders.
            Your shop, payments and orders in one place.
          </p>
          <div id="lp-hero-cta" className="mt-7 flex flex-col items-start gap-3">
            <LpStartFreeLink
              placement="hero"
              label={HOME_PRODUCERS_COPY.ctaLabel}
              href={HOME_PRODUCERS_SIGNUP_HREF}
              className={GOLD_CTA_CLASS}
            />
            <p className="text-sm leading-relaxed text-[var(--ink-on-dark)]/80">
              {HOME_PRODUCERS_COPY.reassurance}
            </p>
          </div>
        </div>
      </div>

      <div className="relative aspect-[16/10] w-full sm:aspect-[4/3] md:aspect-[16/10] lg:absolute lg:inset-0 lg:-z-10 lg:aspect-auto">
        <Image
          src="/lp/home-producers/hero-produce.jpg"
          alt="Freshly harvested vegetables and herbs in a timber crate with homemade jam jars, spice mixes, eggs and a sourdough loaf on a farm-stand table"
          fill
          preload
          sizes="100vw"
          className="object-cover object-[70%_center] lg:object-right"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[var(--field)] to-transparent lg:hidden"
        />
        <div
          aria-hidden
          className="absolute inset-0 hidden bg-[linear-gradient(90deg,var(--field)_0%,var(--field)_30%,rgb(23_54_31/0.82)_46%,rgb(23_54_31/0.15)_70%,transparent_85%)] lg:block"
        />
        <div className="absolute bottom-6 right-6 hidden sm:block lg:bottom-auto lg:right-[max(2rem,calc((100%-72rem)/2+2rem))] lg:top-24">
          <HeroExampleCard />
        </div>
      </div>
    </section>
  );
}
