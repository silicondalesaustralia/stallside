"use client";

import type { LookOption } from "./look-copy";

type Props<T extends string> = {
  title: string;
  name: string;
  options: LookOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

export default function LookChoice<T extends string>({ title, name, options, value, onChange }: Props<T>) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-medium text-[var(--field)]">{title}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((o) => {
          const selected = o.value === value;
          return (
            <label
              key={o.value}
              className={`flex cursor-pointer items-start gap-2 rounded-md border p-3 text-sm ${
                selected ? "border-[var(--field)] bg-[var(--surface)]" : "border-[var(--border)]"
              }`}
            >
              <input
                type="radio"
                name={name}
                className="mt-1"
                checked={selected}
                onChange={() => onChange(o.value)}
              />
              <span>
                <span className="font-medium text-[var(--field)]">{o.label}</span>
                <span className="block text-xs text-[var(--muted)]">{o.explainer}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
