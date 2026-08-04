const OBJECTIONS = [
  {
    q: "Do I need a card machine?",
    a: "No. Customers pay on their own phones. You only need to print and display your Stallside QR poster.",
  },
  {
    q: "Do customers need an app?",
    a: "No. They scan the QR with their phone camera, choose what they are taking and pay in their browser.",
  },
  {
    q: "What if I'm not technical?",
    a: "Setup is designed to take only a few minutes. Add your products, print the poster and place it at your stall.",
  },
  {
    q: "Won't people just scan and not pay?",
    a: "Stallside works with the same honesty your stall already relies on. It makes paying easier for customers who intended to pay but arrived without enough cash, and logs each confirmed sale immediately.",
  },
] as const;

export default function LpObjections() {
  return (
    <section className="bg-[var(--wash)] px-5 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-[var(--field)] sm:text-3xl">
          Made for the way honesty stalls already work
        </h2>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
          Stallside does not replace the trust behind your stall. It gives
          honest customers more ways to pay and gives you a clearer record of
          what was taken.
        </p>

        {/* Mobile: accordion via details/summary (no client JS) */}
        <div className="mt-8 space-y-3 md:hidden">
          {OBJECTIONS.map((item) => (
            <details
              key={item.q}
              className="group rounded-[var(--radius)] border border-[var(--line)] bg-white px-4 py-3 shadow-sm"
            >
              <summary className="cursor-pointer list-none font-semibold text-[var(--ink)] marker:content-none [&::-webkit-details-marker]:hidden">
                {item.q}
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                {item.a}
              </p>
            </details>
          ))}
        </div>

        {/* Desktop: compact cards */}
        <ul className="mt-8 hidden gap-4 md:grid md:grid-cols-2">
          {OBJECTIONS.map((item) => (
            <li
              key={item.q}
              className="rounded-[var(--radius)] border border-[var(--line)] bg-white p-5 shadow-sm"
            >
              <h3 className="font-semibold text-[var(--ink)]">{item.q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                {item.a}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
