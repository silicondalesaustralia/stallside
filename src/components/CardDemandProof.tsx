import Link from "next/link";

/** Marketing mock of the card-demand signal when Tap & Go isn't connected yet. */
export default function CardDemandProof() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-12">
      <div className="relative rounded-[var(--radius)] border-2 border-[var(--leaf)] bg-[var(--panel)] p-[var(--pad-lg)] sm:p-10">
        <div
          aria-hidden
          className="absolute left-0 top-0 size-8 border-l-2 border-t-2 border-[var(--field)]/35"
          style={{ borderTopLeftRadius: 8 }}
        />
        <p className="pl-3 text-sm font-semibold uppercase tracking-wide text-[var(--leaf)]">
          Free · card-demand counter
        </p>
        <h2 className="mt-2 max-w-2xl pl-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)] sm:text-4xl">
          See the sales you&apos;re leaving on the table
        </h2>
        <p className="mt-4 max-w-2xl pl-3 text-base leading-relaxed text-[var(--muted)] sm:text-lg">
          When Tap &amp; Go isn&apos;t connected yet, shoppers can tap &ldquo;I&apos;d
          have paid by card.&rdquo; You get a running total on your dashboard -
          free on every plan. Connect Stripe to take those sales; go Pro to keep
          100%.
        </p>

        <div className="mt-8 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--wash)] px-5 py-6 pl-3 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Example · this month
          </p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-[var(--field)] sm:text-3xl">
            23 people wanted to pay by card
          </p>
          <p className="mt-1 text-lg font-semibold text-[var(--marigold)] sm:text-xl">
            about $180
          </p>
          <p className="mt-3 max-w-lg text-sm text-[var(--muted)]">
            Connect Stripe and the next one can actually pay. Pro removes the
            Vendl card fee.
          </p>
        </div>

        <div className="mt-8 pl-3">
          <Link
            href="/signup"
            className="inline-flex rounded-[var(--radius-pill)] bg-[var(--leaf)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
          >
            Free
          </Link>
        </div>
      </div>
    </section>
  );
}
