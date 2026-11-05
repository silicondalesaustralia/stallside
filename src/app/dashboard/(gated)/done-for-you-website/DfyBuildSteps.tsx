import { DFY_BUILD_STEPS } from "@/lib/website/dfy-build";

export default function DfyBuildSteps() {
  return (
    <section aria-labelledby="dfy-steps-heading" className="dash-card flex flex-col gap-4 p-5">
      <h2 id="dfy-steps-heading" className="text-lg font-semibold text-[var(--field)]">
        How it works
      </h2>
      <ol className="flex flex-col gap-4">
        {DFY_BUILD_STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-3">
            <span
              aria-hidden
              className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--marigold)]/30 text-sm font-bold text-[var(--field)]"
            >
              {i + 1}
            </span>
            <div className="flex flex-col gap-0.5">
              <h3 className="text-sm font-semibold text-[var(--field)]">{step.title}</h3>
              <p className="text-sm text-[var(--muted)]">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
