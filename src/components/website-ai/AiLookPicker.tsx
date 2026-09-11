"use client";

import type { BrandLookCombo } from "@/lib/website/brand-looks";
import { getFontPair, getPalette } from "@/lib/website/brand-looks";

export default function AiLookPicker({
  looks,
  selectedId,
  onSelect,
}: {
  looks: BrandLookCombo[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-sm font-medium text-[var(--field)]">
        Choose a colour and font look
      </legend>
      <p className="text-xs text-[var(--muted)]">
        Three combinations matched to your style. You can refine in Edit layout later.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {looks.map((look) => {
          const palette = getPalette(look.paletteId);
          const fonts = getFontPair(look.fontPairId);
          const selected = selectedId === look.id;
          return (
            <button
              key={look.id}
              type="button"
              onClick={() => onSelect(look.id)}
              aria-pressed={selected}
              className={`rounded-xl border p-3 text-left transition ${
                selected
                  ? "border-[var(--field)] ring-2 ring-[var(--field)]/20"
                  : "border-[var(--border)] hover:border-[var(--field)]"
              }`}
            >
              <div className="flex h-14 overflow-hidden rounded-lg">
                <span
                  className="flex-1"
                  style={{ background: palette?.accent ?? "#333" }}
                />
                <span
                  className="w-1/3"
                  style={{ background: palette?.secondary ?? "#999" }}
                />
                <span
                  className="w-1/4"
                  style={{ background: palette?.wash ?? "#f5f5f5" }}
                />
              </div>
              <p className="mt-3 text-sm font-semibold text-[var(--field)]">{look.label}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">{look.tagline}</p>
              <p className="mt-2 text-[10px] uppercase tracking-wide text-[var(--muted)]">
                {fonts?.label ?? "Fonts"} · {palette?.label ?? "Palette"}
              </p>
            </button>
          );
        })}
      </div>
      <input type="hidden" name="lookId" value={selectedId} />
    </fieldset>
  );
}
