const FEATURES = [
  {
    title: "Subscriptions",
    body: "Weekly, fortnightly or monthly boxes that customers manage themselves.",
  },
  {
    title: "Memberships",
    body: "Offer member places for regular shares or limited spots.",
  },
  {
    title: "Bundle pricing",
    body: "Volume and bundle deals, like 2 jars for $9.",
  },
  {
    title: "Add-ons & discounts",
    body: "Cart upsells, pre-order add-ons and first-order discounts.",
  },
  {
    title: "Flexible payments",
    body: "Connect Stripe or Square for card payments. Cash and PayID are also available for eligible local purchases.",
  },
  {
    title: "Inventory control",
    body: "Real stock counts, quantity caps and automatic sold-out.",
  },
  {
    title: "Customer notifications",
    body: "Ready-for-collection messages and restock alerts customers opt into.",
  },
  {
    title: "Sale & stock alerts",
    body: "Instant sale and low-stock alerts by email and push.",
  },
] as const;

export default function FeaturesIncluded() {
  return (
    <section className="bg-[var(--wash)] px-5 py-14 sm:px-8 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--marigold)]/15 px-4 py-1.5 text-sm font-semibold text-[var(--field)]">
            <span aria-hidden className="size-2 rounded-full bg-[var(--marigold)]" />
            New features rolled out weekly
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-[1.75rem] font-bold leading-[1.1] tracking-tight text-[var(--field)] sm:text-[2.5rem]">
            Everything included on the Free plan.
          </h2>
          <p className="mt-3 text-base text-[var(--muted)] sm:text-lg">
            Start with pre-orders, then add the tools you need as you grow.
          </p>
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <li
              key={f.title}
              className="rounded-[20px] border border-[var(--line)] bg-[var(--panel)] p-5 shadow-sm"
            >
              <h3 className="flex items-center gap-2 font-[family-name:var(--font-display)] text-lg font-bold text-[var(--field)]">
                <span aria-hidden className="text-[var(--leaf)]">
                  ✓
                </span>
                {f.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">{f.body}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-center text-xs text-[var(--muted)]">
          Payment methods vary by region and checkout type.
        </p>
      </div>
    </section>
  );
}
