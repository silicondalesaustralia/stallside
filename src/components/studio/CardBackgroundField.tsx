"use client";

import { useId } from "react";
import { parseCategoryCardBackground, type CategoryCardBackground } from "@/lib/studio/category-looks";

const OPTIONS: { value: CategoryCardBackground; label: string }[] = [
  { value: "white", label: "Card" },
  { value: "none", label: "No background" },
];

/** Whether a section's cards sit in a filled box or straight on the section background. */
export default function CardBackgroundField({ value, onChange }: { value: unknown; onChange: (v: CategoryCardBackground) => void }) {
  const name = useId();
  const current = parseCategoryCardBackground(value);
  return (
    <fieldset className="flex flex-col gap-1">
      <legend className="text-xs font-semibold text-[var(--muted)]">Card background</legend>
      <div className="flex gap-4">
        {OPTIONS.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2 text-sm">
            <input type="radio" name={name} checked={current === opt.value} onChange={() => onChange(opt.value)} />
            {opt.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
