"use client";

import type { CraftSpacerProps } from "@/components/studio/sections/CraftSpacerSection";
import { SPACER_MAX, SPACER_MIN, spacerHeightOf, spacerView } from "@/lib/studio/spacer-settings";

function HeightField({ id, label, value, onChange }: { id: string; label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold text-[var(--field)]">{label}</label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="range"
          min={SPACER_MIN}
          max={SPACER_MAX}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="min-w-0 flex-1 accent-[var(--leaf)]"
        />
        <input
          type="number"
          min={SPACER_MIN}
          max={SPACER_MAX}
          value={value}
          aria-label={`${label} in pixels`}
          onChange={(e) => onChange(spacerHeightOf(Number(e.target.value)))}
          className="w-16 rounded-lg border border-[var(--line)] px-2 py-1 text-sm"
        />
        <span className="text-xs text-[var(--muted)]">px</span>
      </div>
    </div>
  );
}

/** Spacer height in pixels, with an optional different height on phones. */
export default function SpacerSettings({ props, setProp }: { props: CraftSpacerProps; setProp: (k: string, v: unknown) => void }) {
  const view = spacerView(props);
  const ownMobile = typeof props.mobileHeight === "number";
  return (
    <>
      <p className="text-xs text-[var(--muted)]">Drag the green handle under the spacer on the page, or set an exact height here.</p>
      <HeightField id="spacer-height" label="Height" value={view.height} onChange={(v) => setProp("height", v)} />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={ownMobile}
          onChange={(e) => setProp("mobileHeight", e.target.checked ? Math.round(view.height / 2) || SPACER_MIN : undefined)}
        />
        Different height on phones
      </label>
      {ownMobile ? (
        <HeightField id="spacer-mobile-height" label="Height on phones" value={view.mobileHeight} onChange={(v) => setProp("mobileHeight", v)} />
      ) : null}
      <p className="text-xs text-[var(--muted)]">Give it a background colour under Style to use it as a coloured band.</p>
    </>
  );
}
