const STEPS = [
  {
    title: "Customers opt in",
    body: "At checkout, on pre-order pages and subscriptions, customers can tick a box to get texts: marketing news, order updates, or both.",
  },
  {
    title: "You write the message",
    body: "Compose a short text, like a restock alert, this week's pick-up reminder or a new pre-order opening.",
  },
  {
    title: "Pick who gets it",
    body: "Send to everyone who opted in, a saved list, buyers of a product, or one customer, the same way email works today.",
  },
  {
    title: "Vendl sends it",
    body: "Texts go out from Vendl. Anyone who didn't opt in, or who replies STOP, is never messaged.",
  },
] as const;

export default function SmsComingSoon() {
  return (
    <section className="dash-card flex flex-col gap-4 px-5 py-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Coming soon</p>
        <h2 className="mt-1 text-lg font-semibold">SMS messages</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Text the customers who&apos;ve said yes to hearing from you, for marketing or for updates on their orders.
        </p>
      </div>
      <ol className="grid gap-3 sm:grid-cols-2">
        {STEPS.map((step, i) => (
          <li key={step.title} className="rounded-lg bg-[var(--wash)] p-4">
            <p className="text-sm font-semibold">
              {i + 1}. {step.title}
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">{step.body}</p>
          </li>
        ))}
      </ol>
      <p className="text-sm text-[var(--muted)]">
        Until then, use the Email tab to reach opted-in customers.
      </p>
    </section>
  );
}
