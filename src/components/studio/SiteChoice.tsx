"use client";

/** A small grid of option buttons for one site-wide setting. */
export default function SiteChoice<T extends string>({
  label,
  options,
  labels,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  labels: Record<T, string>;
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="space-y-1.5">
      <p className="block text-xs font-semibold text-[var(--field)]">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        {options.map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={value === id}
            className={`rounded-lg border px-2 py-2 text-left text-xs font-semibold ${
              value === id
                ? "border-[var(--field)] bg-[var(--wash)] text-[var(--field)]"
                : "border-[var(--line)] text-[var(--muted)]"
            }`}
            onClick={() => onChange(id)}
          >
            {labels[id]}
          </button>
        ))}
      </div>
    </div>
  );
}
