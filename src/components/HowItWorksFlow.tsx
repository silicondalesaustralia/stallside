type Tone = "owner" | "customer" | "alert";

type FlowBox = {
  title: string;
  subtitle: string;
  tone: Tone;
};

const OWNER_START: FlowBox = {
  title: "Print a QR",
  subtitle: "One per site",
  tone: "owner",
};

const CUSTOMER: FlowBox[] = [
  { title: "Scan", subtitle: "No app needed", tone: "customer" },
  { title: "Pick and pay", subtitle: "Cash, confirmed", tone: "customer" },
  { title: "Sold", subtitle: "Done", tone: "customer" },
];

const OWNER_RESULT: FlowBox[] = [
  { title: "Sale alert", subtitle: "Email and push", tone: "owner" },
  { title: "Stock drops", subtitle: "Live count", tone: "owner" },
  { title: "Low stock", subtitle: "Before you run out", tone: "alert" },
];

const MOBILE_STEPS: FlowBox[] = [OWNER_START, ...CUSTOMER, ...OWNER_RESULT];

function toneClass(tone: Tone): string {
  if (tone === "alert") return "border-[var(--marigold)] bg-[var(--marigold)] text-[var(--field)]";
  if (tone === "customer") return "border-[var(--line)] bg-[var(--wash)] text-[var(--ink)]";
  return "border-[var(--leaf)] bg-[var(--leaf)] text-white";
}

function Box({ title, subtitle, tone }: FlowBox) {
  return (
    <div
      className={`flex h-14 min-w-[7.5rem] flex-col justify-center rounded-[var(--radius-sm)] border-[0.5px] px-3 py-1.5 ${toneClass(tone)}`}
    >
      <p className="text-xs font-semibold leading-tight">{title}</p>
      <p className="text-[10px] leading-tight opacity-80">{subtitle}</p>
    </div>
  );
}

function ArrowDown() {
  return <span className="text-[var(--muted)]" aria-hidden>↓</span>;
}

function ArrowRight() {
  return <span className="text-[var(--muted)]" aria-hidden>→</span>;
}

export default function HowItWorksFlow() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-12">
      <div className="relative rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-[var(--pad-lg)]">
        <div
          aria-hidden
          className="absolute left-5 top-5 size-7 border-l-2 border-t-2 border-[var(--field)]/30 sm:left-7 sm:top-7"
          style={{ borderTopLeftRadius: 8 }}
        />
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)] sm:text-4xl">
          How it works
        </h2>

        {/* Mobile: vertical reflow */}
        <ol className="mt-8 flex flex-col items-center gap-2 md:hidden">
          {MOBILE_STEPS.map((step, i) => (
            <li key={step.title} className="flex flex-col items-center gap-2">
              {i > 0 ? <ArrowDown /> : null}
              <Box {...step} />
            </li>
          ))}
        </ol>

        {/* Desktop: swim rows */}
        <div className="mt-8 hidden gap-y-3 md:grid md:grid-cols-[7.5rem_1fr]">
          <p className="self-center text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Owner
          </p>
          <div className="flex justify-center">
            <Box {...OWNER_START} />
          </div>

          <div aria-hidden className="col-span-2 flex justify-center py-0.5">
            <ArrowDown />
          </div>

          <p className="self-center text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Customer
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {CUSTOMER.map((step, i) => (
              <div key={step.title} className="flex items-center gap-2">
                {i > 0 ? <ArrowRight /> : null}
                <Box {...step} />
              </div>
            ))}
          </div>

          <div aria-hidden className="col-span-2 flex justify-center py-0.5">
            <ArrowDown />
          </div>

          <p className="self-center text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Owner, instantly
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {OWNER_RESULT.map((step, i) => (
              <div key={step.title} className="flex items-center gap-2">
                {i > 0 ? <ArrowRight /> : null}
                <Box {...step} />
              </div>
            ))}
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-[var(--muted)]">
          Cash today. Tap &amp; Go coming soon — same flow, one tap.
        </p>
      </div>
    </section>
  );
}
