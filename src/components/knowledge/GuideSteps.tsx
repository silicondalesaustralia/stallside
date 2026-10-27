import { Lightbulb } from "lucide-react";

type GuideStepsProps = {
  steps: string[];
  tips?: string[];
};

export default function GuideSteps({ steps, tips }: GuideStepsProps) {
  return (
    <>
      <section>
        <h2 className="text-lg font-semibold">Step by step</h2>
        <ol className="mt-4 flex flex-col">
          {steps.map((step, index) => (
            <li key={step} className="relative flex gap-4 pb-5 last:pb-0">
              {index < steps.length - 1 ? (
                <span
                  aria-hidden
                  className="absolute left-[15px] top-8 bottom-0 w-px bg-[var(--line)]"
                />
              ) : null}
              <span className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--leaf)] text-sm font-semibold text-white">
                {index + 1}
              </span>
              <p className="pt-1 text-[15px] leading-relaxed text-[var(--ink)]">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      {tips?.length ? (
        <aside className="rounded-2xl border border-[var(--marigold)]/40 bg-[var(--marigold)]/10 p-5">
          <h2 className="flex items-center gap-2 font-semibold text-[var(--ink)]">
            <Lightbulb aria-hidden className="size-5 text-[var(--warn)]" />
            Good to know
          </h2>
          <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-[var(--ink)]">
            {tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </aside>
      ) : null}
    </>
  );
}
