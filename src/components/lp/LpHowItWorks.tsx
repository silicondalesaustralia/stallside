const STEPS = [
  {
    title: "Print your QR",
    body: "One A4 poster per stall. Stick it up.",
  },
  {
    title: "They scan and pay",
    body: "No app, no account. Cash, PayID, card, Apple Pay or Google Pay.",
  },
  {
    title: "You get told instantly",
    body: "Sale alert on your phone, stock count updates itself.",
  },
] as const;

export default function LpHowItWorks() {
  return (
    <section className="bg-[var(--wash)] px-5 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-3xl">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-[var(--field)] sm:text-3xl">
          How it works
        </h2>
        <ol className="mt-8 space-y-6">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span
                aria-hidden
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--field)] text-sm font-semibold text-[var(--ink-on-dark)]"
              >
                {index + 1}
              </span>
              <div>
                <p className="font-semibold text-[var(--ink)]">{step.title}</p>
                <p className="mt-1 text-[var(--muted)]">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
