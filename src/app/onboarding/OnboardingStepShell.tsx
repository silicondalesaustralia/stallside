import BrandLockup from "@/components/BrandLockup";
import { ONBOARDING_STEPS, type OnboardingStep } from "@/lib/business-mode";

export default function OnboardingStepShell({
  step,
  title,
  subtitle,
  children,
}: {
  step: OnboardingStep;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const index = ONBOARDING_STEPS.indexOf(step);
  return (
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-1 flex-col px-6 py-12">
      <BrandLockup />
      <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
        Setup · step {index + 1} of {ONBOARDING_STEPS.length}
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--line)]">
        <div
          className="h-full rounded-full bg-[var(--leaf)]"
          style={{
            width: `${Math.round(((index + 1) / ONBOARDING_STEPS.length) * 100)}%`,
          }}
        />
      </div>
      <h1 className="mt-6 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)]">
        {title}
      </h1>
      <p className="mt-2 text-[var(--muted)]">{subtitle}</p>
      <div className="mt-8">{children}</div>
    </main>
  );
}
