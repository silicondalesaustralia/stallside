"use client";

type Option<T extends string> = { value: T; label: string };

export default function PresetPicker<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-[var(--field)]">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`rounded-lg border px-2 py-2 text-left text-xs font-semibold transition ${
              value === opt.value
                ? "border-[var(--field)] bg-[var(--field)] text-white"
                : "border-[var(--line)] bg-white text-[var(--field)] hover:bg-[var(--wash)]"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
