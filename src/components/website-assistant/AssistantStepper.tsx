import { STEP_LABELS } from "./assistant-copy";

type Props = { step: number; onStep: (step: number) => void; disabled?: boolean };

export default function AssistantStepper({ step, onStep, disabled }: Props) {
  return (
    <ol className="flex flex-wrap gap-2" aria-label="Website assistant steps">
      {STEP_LABELS.map((label, i) => {
        const n = i + 1;
        const current = n === step;
        return (
          <li key={label}>
            <button
              type="button"
              disabled={disabled}
              aria-current={current ? "step" : undefined}
              onClick={() => onStep(n)}
              className={`rounded-full border px-3 py-1 text-sm ${
                current
                  ? "border-[var(--field)] bg-[var(--field)] text-white"
                  : "border-[var(--border)] bg-white text-[var(--field)]"
              } disabled:opacity-60`}
            >
              {n} · {label}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
