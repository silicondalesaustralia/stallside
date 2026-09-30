import BotanicalSprig from "@/components/lp/home-producers/BotanicalSprig";
import { testimonials } from "@/lib/testimonials";

const RECOMMEND_QUOTE =
  "We'd happily recommend Vendl.app to other small businesses and farm stands!";

export default function ProducerProof() {
  const fletchers = testimonials.find((t) => t.id === "fletchers-donnybrook");
  if (!fletchers || !fletchers.quote.includes(RECOMMEND_QUOTE)) return null;

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
              &ldquo;{RECOMMEND_QUOTE}&rdquo;
            </p>
          </blockquote>
          <figcaption className="mt-5 text-sm text-[var(--muted)]">
            <span className="block font-semibold text-[var(--ink)]">{fletchers.name}</span>
            <span className="block">{fletchers.location}</span>
            <span className="mt-2 block">
              Farm and home producer selling goat&apos;s milk soaps and farm products
              through Vendl.
            </span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
