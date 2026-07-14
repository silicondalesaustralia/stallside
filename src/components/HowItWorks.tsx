const STEPS = [
  {
    n: "1",
    title: "Print a QR",
    body: "One QR per site. Stick it on the gate, the woodpile, the fridge, the sign.",
  },
  {
    n: "2",
    title: "They scan and pay",
    body: "Customer picks what they're taking and confirms payment. No app to download.",
  },
  {
    n: "3",
    title: "You watch stock",
    body: "Sale alerts on your phone. Stock updates instantly. Restock from the paddock.",
  },
] as const;

export default function HowItWorks() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16">
      <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)] sm:text-4xl">
        How it works
      </h2>
      <ol className="mt-10 grid gap-8 sm:grid-cols-3">
        {STEPS.map((step) => (
          <li key={step.n} className="border-t-2 border-[var(--leaf)] pt-4">
            <p className="font-receipt text-sm text-[var(--muted)]">{step.n}</p>
            <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--field)]">
              {step.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
