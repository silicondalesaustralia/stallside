import FeaturedStandCard from "@/components/gallery/FeaturedStandCard";
import TestimonialTile from "@/components/gallery/TestimonialTile";
import LpStartFreeLink from "@/components/lp/LpStartFreeLink";
import {
  GOLD_CTA_CLASS,
  HOME_PRODUCERS_COPY,
  HOME_PRODUCERS_SIGNUP_HREF,
  HOME_PRODUCERS_TESTIMONIALS_ID,
} from "@/lib/home-producers-lp";
import { lpFletcherbrook as stand, lpTestimonials } from "@/lib/home-producers-stories";

export default function ProducerStories() {
  return (
    <section
      id={HOME_PRODUCERS_TESTIMONIALS_ID}
      aria-labelledby="lp-testimonials-heading"
      className="scroll-mt-4 bg-[var(--panel)] px-5 py-14 sm:px-8 lg:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)] sm:text-sm">
            Testimonials
          </p>
          <h2
            id="lp-testimonials-heading"
            className="mt-2 font-[family-name:var(--font-display)] text-[1.75rem] font-bold leading-[1.1] tracking-tight text-[var(--field)] sm:text-[2.5rem]"
          >
            Real producers. Growing businesses.
          </h2>
          <p className="mt-3 text-base text-[var(--muted)] sm:text-lg">
            Meet the bakers, growers and makers using Vendl to sell what they produce.
          </p>
        </div>

        {stand ? (
          <div className="mt-10">
            <FeaturedStandCard stand={stand} />
          </div>
        ) : null}

        <div className="mt-8 grid items-start gap-6 md:grid-cols-2">
          {lpTestimonials.map((item, i) => (
            <TestimonialTile key={item.id} item={item} index={i} excerpt />
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-3 text-center">
          <p className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--field)] sm:text-2xl">
            Ready to grow your home business?
          </p>
          <LpStartFreeLink
            placement="testimonials"
            label={HOME_PRODUCERS_COPY.ctaLabel}
            href={HOME_PRODUCERS_SIGNUP_HREF}
            className={GOLD_CTA_CLASS}
          />
          <p className="text-sm text-[var(--muted)]">{HOME_PRODUCERS_COPY.reassurance}</p>
        </div>
      </div>
    </section>
  );
}
