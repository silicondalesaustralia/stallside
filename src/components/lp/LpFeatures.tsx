const FEATURES = [
  "Cash, PayID, card, Apple Pay, Google Pay",
  "Instant sale alerts by push and email",
  "Live stock counts and low-stock warnings",
  "Pre-orders with a collection day",
  "Restock emails to customers who asked to hear",
  "Your own logo and colours on the stall page and poster",
] as const;

export default function LpFeatures() {
  return (
    <section className="bg-[var(--wash)] px-5 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-3xl">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-[var(--field)] sm:text-3xl">
          What you get
        </h2>
        <ul className="mt-6 space-y-3">
          {FEATURES.map((item) => (
            <li
              key={item}
              className="flex gap-3 text-base text-[var(--ink)] sm:text-lg"
            >
              <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--leaf)]" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
