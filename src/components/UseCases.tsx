const CASES = [
  { title: "Farm stalls", line: "Eggs, veg, honey, jam. The honesty box, upgraded." },
  { title: "Firewood & hay", line: "Roadside stacks. Bigger baskets, bigger theft problem." },
  { title: "Flowers & plants", line: "Driveway buckets and nursery benches." },
  { title: "Camp supplies", line: "Ice, firewood, milk, gas — unattended, 24/7." },
  { title: "Honesty car parks", line: "Scan the sign, pay the fee, no meter." },
  { title: "Community fridges", line: "Track what's left, take contributions." },
] as const;

export default function UseCases() {
  return (
    <section id="use-cases" className="mx-auto w-full max-w-6xl px-6 py-12 sm:py-14">
      <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)] sm:text-4xl">
        What it works for
      </h2>
      <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CASES.map((item) => (
          <li key={item.title} className="relative pt-2">
            <div
              aria-hidden
              className="mb-3 size-8 border-l-[3px] border-t-[3px] border-[var(--field)]"
              style={{ borderTopLeftRadius: 8 }}
            />
            <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--field)]">
              {item.title}
            </h3>
            <p className="mt-1 text-sm text-[var(--muted)]">{item.line}</p>
          </li>
        ))}
      </ul>
      <p className="mt-10 font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--field)]">
        If nobody&apos;s standing there, Stallside works.
      </p>
    </section>
  );
}
