"use client";

const PILL = "rounded-lg border px-2.5 py-1.5 text-xs font-semibold";
const PILL_ON = "border-[var(--field)] bg-[var(--wash)] text-[var(--field)]";
const PILL_OFF = "border-[var(--line)] text-[var(--muted)]";

/** A labelled row of pill buttons with a leading "Default" (unset) option. */
export default function PillChoice<T extends string>({
  label,
  options,
  labels,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  labels: Record<T, string>;
  value?: T;
  onChange: (value: T | undefined) => void;
}) {
  return (
    <div className="space-y-1.5">
      <p className="block text-xs font-semibold text-[var(--field)]">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        <button type="button" className={`${PILL} ${!value ? PILL_ON : PILL_OFF}`} onClick={() => onChange(undefined)}>
          Default
        </button>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={`${PILL} ${value === option ? PILL_ON : PILL_OFF}`}
            onClick={() => onChange(option)}
          >
            {labels[option]}
          </button>
        ))}
      </div>
    </div>
  );
}
