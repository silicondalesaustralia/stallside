import BotanicalSprig from "@/components/lp/home-producers/BotanicalSprig";
import LpScrollLink from "@/components/lp/LpScrollLink";
import { HOME_PRODUCERS_TESTIMONIALS_ID } from "@/lib/home-producers-lp";
import { fletchersShortExcerpt as fletchers } from "@/lib/home-producers-stories";

export default function ProducerProof() {
  if (!fletchers) return null;

  return (
    <section className="bg-[var(--panel)] px-5 py-14 sm:px-8 lg:py-16">
      <div className="mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="hidden flex-col items-center gap-4 md:flex">
          <p className="rounded-[var(--radius-pill)] bg-[var(--wash)] px-4 py-1.5 text-sm font-medium text-[var(--leaf-dark)]">
            Farm &amp; home producer
          </p>
          <BotanicalSprig className="h-52 w-auto text-[var(--leaf)]/70 lg:h-60" />
        </div>
        <figure>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)] sm:text-sm">
            Made for real home producers
          </p>
          <blockquote className="mt-3">
            <p className="font-[family-name:var(--font-display)] text-2xl font-bold leading-snug text-[var(--field)] sm:text-[2rem]">
              &ldquo;{fletchers.quote[0]}&rdquo;
            </p>
          </blockquote>
          <figcaption className="mt-5 text-sm text-[var(--muted)]">
            <span className="block font-semibold text-[var(--ink)]">{fletchers.name}</span>
            <span className="block">{fletchers.location}</span>
            <span className="mt-1 block text-xs">Excerpt</span>
            <span className="mt-2 block">
              Farm and home producer selling goat&apos;s milk soaps and farm products
              through Vendl.
            </span>
          </figcaption>
          <LpScrollLink
            targetId={HOME_PRODUCERS_TESTIMONIALS_ID}
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--leaf-dark)] underline-offset-4 hover:underline"
          >
            Read their story
            <span aria-hidden>&darr;</span>
          </LpScrollLink>
        </figure>
      </div>
    </section>
  );
}
