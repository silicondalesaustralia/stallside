const STEPS = [
  {
    title: "Share your link",
    body: "Post it in groups, send it to other makers, or add it to your socials.",
  },
  {
    title: "They join Vendl",
    body: "Anyone who signs up within 90 days of clicking your link is linked to you.",
  },
  {
    title: "Earn 50% for life",
    body: "When they pay for Pro, you earn 50% of every payment (excluding tax) for as long as they stay on Pro.",
  },
  {
    title: "Get paid",
    body: "We pay out manually. Commission only counts for payments made while you're on Pro yourself.",
  },
] as const;

export default function ReferralHowItWorks() {
  return (
    <section className="dash-card p-5">
      <h2 className="font-semibold text-[var(--field)]">How it works</h2>
      <ol className="mt-3 grid gap-4 sm:grid-cols-2">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--field)] text-sm font-bold text-[var(--ink-on-dark)]">
              {i + 1}
            </span>
            <span>
              <span className="block text-sm font-semibold text-[var(--field)]">
                {step.title}
              </span>
              <span className="mt-0.5 block text-sm text-[var(--muted)]">
                {step.body}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
