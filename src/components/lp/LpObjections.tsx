const SECONDARIES = [
  {
    q: "Do I need a card machine?",
    a: "No. A printer for the poster is all. Customers pay on their own phones.",
  },
  {
    q: "Do I need to be there?",
    a: "No. That's the point.",
  },
  {
    q: "What if I'm not techy?",
    a: "Print a sheet, stick it up. Setup is a few minutes on your phone.",
  },
] as const;

export default function LpObjections() {
  return (
    <section className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-6 sm:py-12">
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-[var(--field)] sm:text-3xl">
        Won&apos;t people just scan and not pay?
      </h2>
      <p className="mt-4 text-base leading-relaxed text-[var(--muted)] sm:text-lg">
        Same reason your honesty box already works. People who stop at an
        unattended stall came to pay, not to dodge. Stallside doesn&apos;t
        replace that trust — it backs it up, because every sale is logged the
        moment it happens. And it catches the sales a cash tin quietly loses:
        the person with nothing smaller than a fifty.
      </p>
      <ul className="mt-8 space-y-4 border-t border-[var(--line)] pt-8">
        {SECONDARIES.map((item) => (
          <li key={item.q} className="text-base text-[var(--ink)]">
            <span className="font-semibold">{item.q}</span>{" "}
            <span className="text-[var(--muted)]">{item.a}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
