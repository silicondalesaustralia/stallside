import type { ReactNode } from "react";
import { FlowArrowDown, FlowArrowRight } from "@/components/FlowArrows";

export type FlowTone = "owner" | "customer" | "alert";

export type FlowBox = {
  title: string;
  subtitle: string;
  tone: FlowTone;
};

export function flowToneClass(tone: FlowTone): string {
  if (tone === "alert") {
    return "border-[var(--marigold)] bg-[var(--marigold)] text-[var(--field)]";
  }
  if (tone === "customer") {
    return "border-[var(--field)] bg-[var(--field)] text-[var(--ink-on-dark)]";
  }
  return "border-[var(--leaf)] bg-[var(--leaf)] text-white";
}

export function FlowStepBox({ title, subtitle, tone }: FlowBox) {
  return (
    <div
      className={`flex min-h-[4.5rem] min-w-[10.5rem] flex-col justify-center rounded-[var(--radius-sm)] border px-4 py-3 sm:min-h-[5.25rem] sm:min-w-[12.5rem] sm:px-5 sm:py-3.5 ${flowToneClass(tone)}`}
    >
      <p className="text-sm font-semibold leading-tight sm:text-base">{title}</p>
      <p className="mt-0.5 text-xs leading-tight opacity-80 sm:text-sm">{subtitle}</p>
    </div>
  );
}

export function FlowRoleLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)] sm:text-base">
      {children}
    </p>
  );
}

export function FlowMobileSection({
  label,
  steps,
}: {
  label: string;
  steps: readonly FlowBox[];
}) {
  return (
    <li className="flex w-full flex-col items-center gap-3">
      <FlowRoleLabel>{label}</FlowRoleLabel>
      {steps.map((step, i) => (
        <div key={step.title} className="flex flex-col items-center gap-3">
          {i > 0 ? <FlowArrowDown className="h-12 w-10" /> : null}
          <FlowStepBox {...step} />
        </div>
      ))}
    </li>
  );
}

export function FlowDesktopRow({
  label,
  steps,
}: {
  label: string;
  steps: readonly FlowBox[];
}) {
  return (
    <>
      <div className="flex items-center">
        <FlowRoleLabel>{label}</FlowRoleLabel>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {steps.map((step, i) => (
          <div key={step.title} className="flex items-center gap-2">
            {i > 0 ? <FlowArrowRight className="h-8 w-12" /> : null}
            <FlowStepBox {...step} />
          </div>
        ))}
      </div>
    </>
  );
}
