"use client";

import { useState } from "react";

const fieldClass =
  "w-full rounded-[var(--radius)] border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--leaf)] focus:ring-2";

type Props = {
  name: string;
  label: string;
  defaultValue: string;
  max: number;
  /** Below this the counter turns amber (search snippets look thin). */
  ideal?: number;
  multiline?: boolean;
};

export default function BlogCountedField({ name, label, defaultValue, max, ideal, multiline }: Props) {
  const [value, setValue] = useState(defaultValue);
  const short = ideal !== undefined && value.length < ideal;

  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="flex justify-between font-medium">
        {label}
        <span className={short ? "text-amber-700" : "text-[var(--muted)]"}>
          {value.length}/{max}
        </span>
      </span>
      {multiline ? (
        <textarea
          name={name}
          value={value}
          maxLength={max}
          rows={3}
          onChange={(e) => setValue(e.target.value)}
          className={fieldClass}
        />
      ) : (
        <input
          name={name}
          value={value}
          maxLength={max}
          onChange={(e) => setValue(e.target.value)}
          className={fieldClass}
        />
      )}
    </label>
  );
}
