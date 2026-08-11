type Props = {
  eyebrow?: string;
  headline?: string;
  body?: string;
  points?: string[];
  flow?: string[];
};

const DEFAULTS = {
  eyebrow: "The sale you never see",
  headline: "Someone stops. Wants the eggs. Has no cash. Drives off.",
  body: "That is a sale your cash tin cannot record. Vendl gives them another way to pay before they leave - without adding a terminal, staff member or complicated checkout.",
  points: [
    "One QR poster per stall",
    "Customers use their own phone",
    "You are alerted as soon as they confirm or pay",
  ],
  flow: ["Stops at stall", "Scans QR", "Pays", "You get the sale"],
} as const;

export default function LpMissedSale({
  eyebrow = DEFAULTS.eyebrow,
  headline = DEFAULTS.headline,
  body = DEFAULTS.body,
  points = [...DEFAULTS.points],
  flow = [...DEFAULTS.flow],
}: Props) {
  return (
    <section className="px-5 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl rounded-[var(--radius)] border border-[var(--line)] bg-[var(--wash)] p-6 shadow-sm sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--marigold)]">
          {eyebrow}
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-[var(--field)] sm:text-3xl lg:text-[clamp(2rem,3vw,2.75rem)]">
          {headline}
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
          {body}
        </p>
        <ul className="mt-6 space-y-2">
          {points.map((p) => (
            <li key={p} className="flex gap-2 text-sm text-[var(--ink)] sm:text-base">
              <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--leaf)]" />
              {p}
            </li>
          ))}
        </ul>
        <ol className="mt-8 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          {flow.map((step, i) => (
            <li key={step} className="flex items-center gap-2 text-sm font-semibold text-[var(--field)]">
              <span className="rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-[var(--line)]">
                {step}
              </span>
              {i < flow.length - 1 ? (
                <span aria-hidden className="hidden text-[var(--muted)] sm:inline">
                  →
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
