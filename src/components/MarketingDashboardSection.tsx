import MarketingDashboardShot from "@/components/MarketingDashboardShot";

export default function MarketingDashboardSection({
  currency = "AUD",
  standName = "Green Valley Eggs",
  eyebrow = "Owner dashboard",
  headline = "See every sale, stock alert, and subscription in one place",
  support = "The same view stall owners use every day - revenue, orders, low stock, pre-order pages, and live boxes.",
}: {
  currency?: string;
  standName?: string;
  eyebrow?: string;
  headline?: string;
  support?: string;
}) {
  return (
    <section className="mx-auto w-full max-w-[86rem] px-5 py-10 sm:px-6 sm:py-12">
      <div className="relative mb-6">
        <div
          aria-hidden
          className="absolute left-0 top-0 size-8 border-l-2 border-t-2 border-[var(--field)]/35"
          style={{ borderTopLeftRadius: 8 }}
        />
        <p className="pl-3 text-xs font-semibold uppercase tracking-wide text-[var(--leaf)]">
          {eyebrow}
        </p>
        <h2 className="mt-2 pl-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)] sm:text-4xl">
          {headline}
        </h2>
        <p className="mt-3 max-w-2xl pl-3 text-base text-[var(--muted)] sm:text-lg">
          {support}
        </p>
      </div>
      <MarketingDashboardShot currency={currency} standName={standName} />
    </section>
  );
}
