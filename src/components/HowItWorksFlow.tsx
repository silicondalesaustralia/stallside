import type { ReactNode } from "react";
import { FlowArrowDown, FlowArrowRight } from "@/components/FlowArrows";

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

function toneClass(tone: Tone): string {
  if (tone === "alert") {
    return "border-[var(--marigold)] bg-[var(--marigold)] text-[var(--field)]";
  }
  if (tone === "customer") {
    return "border-[var(--field)] bg-[var(--field)] text-[var(--ink-on-dark)]";
  }
  return "border-[var(--leaf)] bg-[var(--leaf)] text-white";
}

function Box({ title, subtitle, tone }: FlowBox) {
  return (
    <div
      className={`flex min-h-[4.5rem] min-w-[10.5rem] flex-col justify-center rounded-[var(--radius-sm)] border px-4 py-3 sm:min-h-[5.25rem] sm:min-w-[12.5rem] sm:px-5 sm:py-3.5 ${toneClass(tone)}`}
    >
      <p className="text-sm font-semibold leading-tight sm:text-base">{title}</p>
      <p className="mt-0.5 text-xs leading-tight opacity-80 sm:text-sm">{subtitle}</p>
    </div>
  );
}

function RoleLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)] sm:text-base">
      {children}
    </p>
  );
}

function MobileSection({
  label,
  steps,
}: {
  label: string;
  steps: readonly FlowBox[];
}) {
  return (
    <li className="flex w-full flex-col items-center gap-3">
      <RoleLabel>{label}</RoleLabel>
      {steps.map((step, i) => (
        <div key={step.title} className="flex flex-col items-center gap-3">
          {i > 0 ? <FlowArrowDown className="h-12 w-10" /> : null}
          <Box {...step} />
        </div>
      ))}
    </li>
  );
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

        {/* Mobile: labelled swim sections */}
        <ol className="mt-8 flex flex-col items-center gap-6 md:hidden">
          <MobileSection label="Owner" steps={[OWNER_START]} />
          <FlowArrowDown className="h-12 w-10" />
          <MobileSection label="Customer" steps={CUSTOMER} />
          <FlowArrowDown className="h-12 w-10" />
          <MobileSection label="Owner, instantly" steps={OWNER_RESULT} />
        </ol>

        {/* Desktop: swim rows */}
        <div className="mt-10 hidden gap-y-3 md:grid md:grid-cols-[10rem_1fr]">
          <div className="flex items-center">
            <RoleLabel>Owner</RoleLabel>
          </div>
          <div className="flex justify-center">
            <Box {...OWNER_START} />
          </div>

          <div aria-hidden className="col-span-2 flex justify-center py-2">
            <FlowArrowDown className="h-12 w-10" />
          </div>

          <div className="flex items-center">
            <RoleLabel>Customer</RoleLabel>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {CUSTOMER.map((step, i) => (
              <div key={step.title} className="flex items-center gap-2">
                {i > 0 ? <FlowArrowRight className="h-8 w-12" /> : null}
                <Box {...step} />
              </div>
            ))}
          </div>

          <div aria-hidden className="col-span-2 flex justify-center py-2">
            <FlowArrowDown className="h-12 w-10" />
          </div>

          <div className="flex items-center">
            <RoleLabel>Owner, instantly</RoleLabel>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {OWNER_RESULT.map((step, i) => (
              <div key={step.title} className="flex items-center gap-2">
                {i > 0 ? <FlowArrowRight className="h-8 w-12" /> : null}
                <Box {...step} />
              </div>
            ))}
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-[var(--muted)]">
          Customers scan free - no app, no account. Cash or Card / Tap &amp; Go —
          same flow, one tap.
        </p>
      </div>
    </section>
  );
}
