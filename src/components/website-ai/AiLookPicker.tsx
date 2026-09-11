"use client";

import { useEffect, useState } from "react";
import type { BrandLookCombo } from "@/lib/website/brand-looks";
import { getFontPair, getPalette } from "@/lib/website/brand-looks";
import FontPairPicker from "@/components/website/FontPairPicker";

export default function AiLookPicker({
  looks,
  selectedId,
  onSelect,
}: {
  looks: BrandLookCombo[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const selectedLook = looks.find((l) => l.id === selectedId) ?? looks[0];
  const recommendedFontId = selectedLook?.fontPairId ?? "market-default";
  const [fontPairId, setFontPairId] = useState(recommendedFontId);

  useEffect(() => {
    setFontPairId(recommendedFontId);
  }, [recommendedFontId]);

  return (
    <div className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium text-[var(--field)]">
          Choose a colour palette
        </legend>
        <p className="text-xs text-[var(--muted)]">
          Three looks matched to your brand. Each suggests fonts — you can change fonts
          below or later in Branding.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {looks.map((look) => {
            const palette = getPalette(look.paletteId);
            const accent = look.accentOverride ?? palette?.accent ?? "#333";
            const secondary = look.secondaryOverride ?? palette?.secondary ?? "#999";
            const wash = palette?.wash ?? "#f5f5f5";
            const selected = selectedId === look.id;
            const fonts = getFontPair(look.fontPairId);
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
                  <span className="flex-1" style={{ background: accent }} />
                  <span className="w-1/3" style={{ background: secondary }} />
                  <span className="w-1/4" style={{ background: wash }} />
                </div>
                <p className="mt-3 text-sm font-semibold text-[var(--field)]">{look.label}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">{look.tagline}</p>
                {fonts ? (
                  <p className="mt-2 text-xs text-[var(--field)]">
                    Fonts: <span className="font-medium">{fonts.label}</span>
                  </p>
                ) : null}
              </button>
            );
          })}
        </div>
        <input type="hidden" name="lookId" value={selectedId} />
      </fieldset>

      <FontPairPicker
        selectedId={fontPairId}
        onSelect={setFontPairId}
        recommendedId={recommendedFontId}
        compact
      />
    </div>
  );
}
