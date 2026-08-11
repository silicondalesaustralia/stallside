type Stat = { label: string; value: string; warn?: boolean };

type Props = {
  eyebrow?: string;
  headline?: string;
  body?: string;
  benefits?: string[];
  note?: string;
  panelTitle?: string;
  panelSubtitle?: string;
  stats?: Stat[];
  recentTitle?: string;
  recentSub?: string;
};

const DEFAULT_BENEFITS = [
  "Instant sale notifications",
  "Live stock counts",
  "Low-stock warnings",
  "Orders and sales history",
  "Pre-orders for collection days",
  "Restock notifications for regular customers",
] as const;

export default function LpProductProof({
  eyebrow = "More than a payment QR",
  headline = "Know what sold, what is left and when to restock.",
  body = "Every confirmed sale appears in your Vendl dashboard. Stock counts fall automatically, and low-stock alerts help you restock before the next customer arrives.",
  benefits = [...DEFAULT_BENEFITS],
  note = "Every feature is included on Free. Pro only changes the Vendl card fee.",
  panelTitle = "Example dashboard",
  panelSubtitle = "Green Valley Eggs",
  stats = [
    { label: "Revenue (7d)", value: "A$491.00" },
    { label: "Orders", value: "47" },
    { label: "Dozen eggs left", value: "8" },
    { label: "Low stock", value: "2 items", warn: true },
  ],
  recentTitle = "Recent sale · A$12.00",
  recentSub = "Dozen eggs · PayID",
}: Props) {
  return (
    <section className="px-5 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-12">
        <div className="order-first rounded-[var(--radius)] border border-[var(--line)] bg-white p-4 shadow-md sm:p-5 lg:order-none">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            {panelTitle}
          </p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-lg font-bold text-[var(--field)]">
            {panelSubtitle}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--panel)] p-3"
              >
                <p className="text-[11px] text-[var(--muted)]">{s.label}</p>
                <p
                  className={`mt-1 text-lg font-bold ${
                    s.warn ? "text-[var(--warn)]" : "text-[var(--field)]"
                  }`}
                >
                  {s.value}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-[var(--radius-sm)] bg-[var(--wash)] px-3 py-2 text-sm">
            <p className="font-semibold text-[var(--leaf)]">{recentTitle}</p>
            <p className="text-[var(--muted)]">{recentSub}</p>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--leaf)]">
            {eyebrow}
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-[var(--field)] sm:text-3xl lg:text-[clamp(2rem,3vw,3rem)]">
            {headline}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[var(--muted)] sm:text-lg">
            {body}
          </p>
          <ul className="mt-6 space-y-2.5">
            {benefits.map((b) => (
              <li key={b} className="flex gap-2.5 text-sm text-[var(--ink)] sm:text-base">
                <span aria-hidden className="mt-0.5 text-[var(--leaf)]">
                  ✓
                </span>
                {b}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm font-medium text-[var(--field)]">{note}</p>
        </div>
      </div>
    </section>
  );
}
