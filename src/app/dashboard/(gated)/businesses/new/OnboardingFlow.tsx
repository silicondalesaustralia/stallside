import { Fragment } from "react";
import { FlowArrowDown, FlowArrowRight } from "@/components/FlowArrows";
import OnboardingStepIcon, { type OnboardingStepIconName } from "./OnboardingStepIcon";

const STEPS: { icon: OnboardingStepIconName; title: string; detail: string }[] = [
  { icon: "account", title: "Create your business account", detail: "Name, location and currency" },
  { icon: "products", title: "Add what you sell", detail: "Products, subscriptions, pre-orders — however you sell" },
  { icon: "website", title: "Create your website and/or farm stand", detail: "Online store, QR farm stand, or both" },
  { icon: "sell", title: "Start selling", detail: "Take payments and fulfil orders" },
];

export default function OnboardingFlow() {
  return (
    <ol
      aria-label="How onboarding works"
      className="mt-4 flex flex-col items-stretch md:flex-row md:items-start"
    >
      {STEPS.map((step, i) => (
        <Fragment key={step.icon}>
          {i > 0 && (
            <li aria-hidden className="flex justify-center md:self-center md:pt-0">
              <FlowArrowDown className="h-8 w-6 md:hidden" />
              <FlowArrowRight className="hidden h-6 w-10 md:block" />
            </li>
          )}
          <li
            className={`flex flex-1 items-start gap-3 rounded-xl border p-3 md:flex-col md:items-center md:text-center ${
              i === 0
                ? "border-[var(--leaf)] bg-white"
                : "border-[var(--line)] bg-white/60"
            }`}
          >
            <span className="relative flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--leaf)]/10 text-[var(--leaf)]">
              <OnboardingStepIcon name={step.icon} />
              <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-[var(--leaf)] text-[11px] font-semibold text-white">
                {i + 1}
              </span>
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">{step.title}</span>
              <span className="text-xs text-[var(--muted)]">{step.detail}</span>
              {i === 0 && (
                <span className="text-xs font-medium text-[var(--leaf)]">You are here</span>
              )}
            </span>
          </li>
        </Fragment>
      ))}
    </ol>
  );
}
