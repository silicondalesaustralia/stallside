"use client";

const INPUT = "w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm";

/** Dropdown for one site-wide setting; the empty option means "template default". */
export default function SiteStyleSelect<T extends string>({
  id,
  label,
  options,
  labels,
  value,
  onChange,
  defaultLabel = "Default",
}: {
  id: string;
  label: string;
  options: readonly T[];
  labels: Record<T, string>;
  value: T | undefined;
  onChange: (v: T | undefined) => void;
  defaultLabel?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold text-[var(--field)]">{label}</label>
      <select id={id} className={INPUT} value={value ?? ""} onChange={(e) => onChange((e.target.value || undefined) as T | undefined)}>
        <option value="">{defaultLabel}</option>
        {options.map((o) => (
          <option key={o} value={o}>{labels[o]}</option>
        ))}
      </select>
    </div>
  );
}
