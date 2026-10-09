import FeaturedStandCard from "@/components/gallery/FeaturedStandCard";
import TestimonialTile from "@/components/gallery/TestimonialTile";
import LpStartFreeLink from "@/components/lp/LpStartFreeLink";
import { featuredStands } from "@/lib/featured-stands";
import {
  GOLD_CTA_CLASS,
  HOME_PRODUCERS_COPY,
  HOME_PRODUCERS_SIGNUP_HREF,
  HOME_PRODUCERS_TESTIMONIALS_ID,
} from "@/lib/home-producers-lp";
import { testimonials } from "@/lib/testimonials";

export default function ProducerStories() {
  const stand = featuredStands.find((s) => s.id === "fletcherbrook");

  return (
    <section
      id={HOME_PRODUCERS_TESTIMONIALS_ID}
      aria-labelledby="lp-testimonials-heading"
      className="scroll-mt-4 bg-[var(--wash)] px-5 py-14 sm:px-8 lg:py-20"
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
            Real producers. Real stands.
          </h2>
          <p className="mt-3 text-base text-[var(--muted)] sm:text-lg">
            Home producers and farm stands already selling with Vendl, in their own words.
          </p>
        </div>

        {stand ? (
          <div className="mt-10">
            <FeaturedStandCard stand={stand} />
          </div>
        ) : null}

        <div className="mt-8 grid items-start gap-6 md:grid-cols-2">
          {testimonials.map((item, i) => (
            <TestimonialTile key={item.id} item={item} index={i} />
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-3 text-center">
          <p className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--field)] sm:text-2xl">
            Ready to open your own stand?
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
