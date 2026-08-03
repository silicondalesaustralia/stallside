import { FlowArrowDown } from "@/components/FlowArrows";
import {
  FlowDesktopRow,
  FlowMobileSection,
  FlowRoleLabel,
  FlowStepBox,
  type FlowBox,
} from "@/components/FlowDiagramBits";

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

const RESTOCK_CUSTOMER: FlowBox[] = [
  { title: "Opt in", subtitle: "One tap after pay", tone: "customer" },
];

const RESTOCK_OWNER: FlowBox[] = [
  { title: "Restock", subtitle: "Fill the stand", tone: "owner" },
  { title: "Notify customers", subtitle: "One button", tone: "owner" },
];

const RESTOCK_RESULT: FlowBox[] = [
  { title: "Back in stock", subtitle: "Email when you restock", tone: "alert" },
];

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

        <ol className="mt-8 flex flex-col items-center gap-6 md:hidden">
          <FlowMobileSection label="Owner" steps={[OWNER_START]} />
          <FlowArrowDown className="h-12 w-10" />
          <FlowMobileSection label="Customer" steps={CUSTOMER} />
          <FlowArrowDown className="h-12 w-10" />
          <FlowMobileSection label="Owner, instantly" steps={OWNER_RESULT} />
        </ol>

        <div className="mt-10 hidden gap-y-3 md:grid md:grid-cols-[10rem_1fr]">
          <div className="flex items-center">
            <FlowRoleLabel>Owner</FlowRoleLabel>
          </div>
          <div className="flex justify-center">
            <FlowStepBox {...OWNER_START} />
          </div>
          <div aria-hidden className="col-span-2 flex justify-center py-2">
            <FlowArrowDown className="h-12 w-10" />
          </div>
          <FlowDesktopRow label="Customer" steps={CUSTOMER} />
          <div aria-hidden className="col-span-2 flex justify-center py-2">
            <FlowArrowDown className="h-12 w-10" />
          </div>
          <FlowDesktopRow label="Owner, instantly" steps={OWNER_RESULT} />
        </div>

        <p className="mt-8 text-center text-sm text-[var(--muted)]">
          Shown: cash on Free. Customers scan free - no app, no account. Card /
          Tap &amp; Go and PayID follow the same flow on Free and Pro.
        </p>

        <div className="mt-10 border-t border-[var(--line)] pt-8">
          <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-[var(--field)] sm:text-3xl">
            When you restock
          </h3>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted)] sm:text-base">
            Regulars can ask to hear when you fill the stand again. Opt-in and
            restock emails are included on Free.
          </p>

          <ol className="mt-8 flex flex-col items-center gap-6 md:hidden">
            <FlowMobileSection label="Customer" steps={RESTOCK_CUSTOMER} />
            <FlowArrowDown className="h-12 w-10" />
            <FlowMobileSection label="Owner" steps={RESTOCK_OWNER} />
            <FlowArrowDown className="h-12 w-10" />
            <FlowMobileSection label="Customer" steps={RESTOCK_RESULT} />
          </ol>

          <div className="mt-10 hidden gap-y-3 md:grid md:grid-cols-[10rem_1fr]">
            <FlowDesktopRow label="Customer" steps={RESTOCK_CUSTOMER} />
            <div aria-hidden className="col-span-2 flex justify-center py-2">
              <FlowArrowDown className="h-12 w-10" />
            </div>
            <FlowDesktopRow label="Owner" steps={RESTOCK_OWNER} />
            <div aria-hidden className="col-span-2 flex justify-center py-2">
              <FlowArrowDown className="h-12 w-10" />
            </div>
            <FlowDesktopRow label="Customer" steps={RESTOCK_RESULT} />
          </div>
        </div>
      </div>
    </section>
  );
}
