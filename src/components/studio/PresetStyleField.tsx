"use client";

import type { PresetOption } from "@/lib/studio/preset-registry";
import type { StudioTemplateId } from "@/lib/studio/types";
import { useStudioMetadata } from "./StudioEditorContext";

const INPUT =
  "w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm";

export default function PresetStyleField<T extends string>({
  presetsBySkin,
  value,
  onChange,
}: {
  presetsBySkin: Record<StudioTemplateId, PresetOption<T>[]>;
  value: string | undefined;
  onChange: (preset: T) => void;
}) {
  const { templateId } = useStudioMetadata();
  const options = presetsBySkin[templateId];
  const current = value ?? options[0]?.value ?? "";
  const known = options.some((o) => o.value === current);

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-[var(--field)]">Style</label>
      <select
        className={INPUT}
        value={current}
        onChange={(e) => {
          const next = options.find((o) => o.value === e.target.value);
          if (next) onChange(next.value);
        }}
      >
        {known ? null : <option value={current}>Current style</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
