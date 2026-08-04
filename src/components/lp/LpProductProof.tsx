import { formatMoney } from "@/lib/money";

const BENEFITS = [
  "Instant sale notifications",
  "Live stock counts",
  "Low-stock warnings",
  "Orders and sales history",
  "Pre-orders for collection days",
  "Restock notifications for regular customers",
] as const;

export default function LpProductProof() {
  return (
    <section className="px-5 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-12">
        <ExampleDashboard />
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--leaf)]">
            More than a payment QR
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-[var(--field)] sm:text-3xl lg:text-[clamp(2rem,3vw,3rem)]">
            Know what sold, what is left and when to restock.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[var(--muted)] sm:text-lg">
            Every confirmed sale appears in your Stallside dashboard. Stock
            counts fall automatically, and low-stock alerts help you restock
            before the next customer arrives.
          </p>
          <ul className="mt-6 space-y-2.5">
            {BENEFITS.map((b) => (
              <li key={b} className="flex gap-2.5 text-sm text-[var(--ink)] sm:text-base">
                <span aria-hidden className="mt-0.5 text-[var(--leaf)]">
                  ✓
                </span>
                {b}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm font-medium text-[var(--field)]">
            Every feature is included on Free. Pro only changes the Stallside
            card fee.
          </p>
        </div>
      </div>
    </section>
  );
}

function ExampleDashboard() {
  return (
    <div className="order-first rounded-[var(--radius)] border border-[var(--line)] bg-white p-4 shadow-md sm:p-5 lg:order-none">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
        Example dashboard
      </p>
      <p className="mt-1 font-[family-name:var(--font-display)] text-lg font-bold text-[var(--field)]">
        Green Valley Eggs
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Stat label="Revenue (7d)" value={formatMoney(49100, "AUD")} />
        <Stat label="Orders" value="47" />
        <Stat label="Dozen eggs left" value="8" />
        <Stat label="Low stock" value="2 items" warn />
      </div>
      <div className="mt-4 rounded-[var(--radius-sm)] bg-[var(--wash)] px-3 py-2 text-sm">
        <p className="font-semibold text-[var(--leaf)]">Recent sale · A$12.00</p>
        <p className="text-[var(--muted)]">Dozen eggs · PayID</p>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  warn,
}: {
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <div className="rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--panel)] p-3">
      <p className="text-[11px] text-[var(--muted)]">{label}</p>
      <p
        className={`mt-1 text-lg font-bold ${warn ? "text-[var(--warn)]" : "text-[var(--field)]"}`}
      >
        {value}
      </p>
    </div>
  );
}
