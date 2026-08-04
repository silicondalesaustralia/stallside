const LOOP = [
  {
    title: "They pay however they want",
    body: "Cash, PayID, card, Apple Pay, Google Pay",
  },
  {
    title: "You know instantly",
    body: "An alert on your phone the moment something sells",
  },
  {
    title: "Stock looks after itself",
    body: "Counts drop automatically, and you're warned before you run out",
  },
] as const;

export default function LpFeatures() {
  return (
    <section className="bg-[var(--wash)] px-5 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-3xl">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-[var(--field)] sm:text-3xl">
          What you get
        </h2>

        <ul className="mt-10 space-y-8">
          {LOOP.map((item) => (
            <li key={item.title}>
              <p className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight text-[var(--field)] sm:text-2xl">
                {item.title}
              </p>
              <p className="mt-2 text-base text-[var(--muted)] sm:text-lg">
                {item.body}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-12 border-t border-[var(--line)] pt-8">
          <h3 className="text-sm font-semibold tracking-wide text-[var(--muted)]">
            And a fair bit more.
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)] sm:text-[0.9375rem]">
            Pre-orders with a collection day, so you know how much to bake
            before anyone turns up. Restock emails to the regulars who asked to
            hear. Your own logo and colours on the stall page and the poster. A
            running count of everyone who&apos;d have paid by card, if you
            haven&apos;t switched card payments on yet.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)] sm:text-[0.9375rem]">
            Plus a good deal more as you grow into it.
          </p>
          <p className="mt-6 text-sm font-semibold text-[var(--ink)]">
            All of it&apos;s on the free plan.
          </p>
        </div>
      </div>
    </section>
  );
}
