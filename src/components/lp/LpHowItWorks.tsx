import LpStartFreeLink from "@/components/lp/LpStartFreeLink";

const STEPS = [
  {
    n: "01",
    title: "Print your stall QR",
    body: "Create your stall, add what you sell and print the ready-made A4 poster.",
  },
  {
    n: "02",
    title: "Customers scan and pay",
    body: "They choose what they are taking and pay by cash, PayID, card, Apple Pay or Google Pay. No app or account required.",
  },
  {
    n: "03",
    title: "You know instantly",
    body: "You receive a sale alert, the order is logged and your available stock updates automatically.",
  },
] as const;

export default function LpHowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 bg-[var(--wash)] px-5 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-[var(--field)] sm:text-3xl lg:text-[clamp(2rem,3vw,3rem)]">
          Up and running in three simple steps
        </h2>
        <p className="mt-3 max-w-2xl text-base text-[var(--muted)] sm:text-lg">
          Print the QR, place it at your stall and let Stallside handle the rest.
        </p>

        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {STEPS.map((step) => (
            <li
              key={step.n}
              className="rounded-[var(--radius)] border border-[var(--line)] bg-white p-5 shadow-sm sm:p-6"
            >
              <span className="font-[family-name:var(--font-mono)] text-sm font-semibold text-[var(--leaf)]">
                {step.n}
              </span>
              <h3 className="mt-3 font-[family-name:var(--font-display)] text-xl font-bold text-[var(--field)]">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)] sm:text-base">
                {step.body}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex flex-col items-start gap-2">
          <LpStartFreeLink placement="how_it_works" />
          <p className="text-sm text-[var(--muted)]">No card details required</p>
        </div>
      </div>
    </section>
  );
}
