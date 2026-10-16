"use client";

import type { LookSection } from "@/lib/website-ai/assistant/brief/look";
import { SECTION_OPTIONS } from "./look-copy";

type Props = {
  available: LookSection[];
  value: LookSection[] | null;
  onChange: (value: LookSection[] | null) => void;
};

export default function LookSectionsField({ available, value, onChange }: Props) {
  if (available.length === 0) return null;
  const auto = value === null;
  const chosen = value ?? [];
  const toggle = (s: LookSection, on: boolean) =>
    onChange(on ? available.filter((a) => a === s || chosen.includes(a)) : chosen.filter((c) => c !== s));

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-sm font-medium text-[var(--field)]">Homepage sections</legend>
      <p className="text-xs text-[var(--muted)]">Only sections that suit your business are listed.</p>
      <label className="flex items-start gap-2 text-sm text-[var(--field)]">
        <input
          type="checkbox"
          className="mt-1"
          checked={auto}
          onChange={(e) => onChange(e.target.checked ? null : [...available])}
        />
        <span>
          Let Vendl choose
          <span className="block text-xs text-[var(--muted)]">Vendl adds the sections it thinks will help most.</span>
        </span>
      </label>
      {auto ? null : (
        <div className="grid gap-2 sm:grid-cols-2">
          {available.map((s) => (
            <label key={s} className="flex items-start gap-2 rounded-md border border-[var(--border)] p-3 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={chosen.includes(s)}
                onChange={(e) => toggle(s, e.target.checked)}
              />
              <span>
                <span className="font-medium text-[var(--field)]">{SECTION_OPTIONS[s].label}</span>
                <span className="block text-xs text-[var(--muted)]">{SECTION_OPTIONS[s].explainer}</span>
              </span>
            </label>
          ))}
        </div>
      )}
    </fieldset>
  );
}
