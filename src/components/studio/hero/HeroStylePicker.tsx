"use client";

import { HERO_STYLES } from "@/lib/studio/hero-styles";
import { missingHeroNeed, type HeroFacts } from "@/lib/studio/hero-needs";
import type { HeroPreset } from "@/lib/studio/preset-registry";
import HeroStyleThumb from "./HeroStyleThumb";

/** Every hero style as a sketch; styles missing something say what to add. */
export default function HeroStylePicker({
  value,
  facts,
  onChange,
}: {
  value: HeroPreset;
  facts: HeroFacts;
  onChange: (style: HeroPreset) => void;
}) {
  const missing = missingHeroNeed(value, facts);
  return (
    <div className="space-y-1.5">
      <p className="block text-xs font-semibold text-[var(--field)]">Style</p>
      <div className="grid grid-cols-2 gap-2">
        {HERO_STYLES.map((s) => (
          <button
            key={s.value}
            type="button"
            title={s.hint}
            aria-pressed={value === s.value}
            onClick={() => onChange(s.value)}
            className={`flex flex-col items-start gap-1.5 rounded-lg border p-2 text-left text-xs font-semibold ${
              value === s.value
                ? "border-[var(--field)] bg-[var(--wash)] text-[var(--field)]"
                : "border-[var(--line)] text-[var(--muted)]"
            } ${missingHeroNeed(s.value, facts) ? "opacity-70" : ""}`}
          >
            <HeroStyleThumb style={s.value} />
            {s.label}
          </button>
        ))}
      </div>
      {missing ? <p className="rounded-md bg-amber-50 px-2 py-1.5 text-xs text-amber-900">{missing}</p> : null}
    </div>
  );
}
