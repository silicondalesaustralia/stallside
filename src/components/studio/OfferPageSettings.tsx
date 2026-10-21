"use client";

import type { OfferPageToggle, OfferPageWording } from "@/lib/studio/offer-page-settings";
import { sectionText, parseSectionTexts, withSectionText } from "@/lib/studio/section-texts";
import type { ThemePalette } from "@/lib/website/sections/colour";
import ColourField from "./ColourField";

const INPUT = "w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm";

/** Pre-order and subscription layouts: what shows, middle column colour, button wording. Card colours are in Style. */
export default function OfferPageSettings({
  props,
  setProp,
  toggles,
  wording,
  palette,
}: {
  props: Record<string, unknown>;
  setProp: (k: string, v: unknown) => void;
  toggles: OfferPageToggle[];
  wording: OfferPageWording[];
  palette: ThemePalette;
}) {
  const texts = parseSectionTexts(props.texts);
  const colour = (key: string) => (typeof props[key] === "string" ? (props[key] as string) : undefined);

  return (
    <>
      <p className="text-xs text-[var(--muted)]">
        Click headings and labels on the page to change their wording. Titles, descriptions and prices come from the
        pre-order or offer itself.
      </p>
      {toggles.length ? (
        <div className="space-y-2">
          <p className="block text-xs font-semibold text-[var(--field)]">Show</p>
          {toggles.map((t) => (
            <label key={t.key} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={props[t.key] !== false} onChange={(e) => setProp(t.key, e.target.checked)} />
              {t.label}
            </label>
          ))}
        </div>
      ) : null}
      <ColourField
        label="Middle column background"
        value={colour("panelBackground")}
        onChange={(v) => setProp("panelBackground", v)}
        palette={palette}
        noneLabel="None (uses the section background)"
      />
      {wording.map((w) => (
        <div key={w.key} className="space-y-1.5">
          <label className="block text-xs font-semibold text-[var(--field)]" htmlFor={`offer-${w.key}`}>
            {w.label}
          </label>
          <input
            id={`offer-${w.key}`}
            className={INPUT}
            value={sectionText(texts, w.key, w.fallback)}
            onChange={(e) => setProp("texts", withSectionText(props.texts, w.key, e.target.value, w.fallback))}
          />
        </div>
      ))}
    </>
  );
}
