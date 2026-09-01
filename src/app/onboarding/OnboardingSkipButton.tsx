import { skipOnboardingStep } from "./actions";
import type { OnboardingStep } from "@/lib/business-mode";

export default function OnboardingSkipButton({
  step,
}: {
  step: OnboardingStep;
}) {
  return (
    <form action={skipOnboardingStep} className="mt-4">
      <input type="hidden" name="step" value={step} />
      <button
        type="submit"
        className="text-sm font-semibold text-[var(--muted)] underline hover:text-[var(--ink)]"
      >
        Skip for now
      </button>
    </form>
  );
}
