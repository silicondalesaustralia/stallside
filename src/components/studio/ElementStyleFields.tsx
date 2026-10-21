"use client";

import type { ThemePalette } from "@/lib/website/sections/colour";
import {
  ELEMENT_CASES,
  ELEMENT_FONTS,
  ELEMENT_SIZES,
  ELEMENT_WEIGHTS,
  type ElementStyle,
} from "@/lib/website/sections/element-style";
import ColourField from "./ColourField";
import SiteStyleSelect from "./SiteStyleSelect";
import FontSamplePreview from "./FontSamplePreview";
import { useFontSamples } from "./useFontSamples";

const SIZES = { xs: "Extra small", sm: "Small", md: "Medium", lg: "Large", xl: "Extra large", "2xl": "2XL", "3xl": "3XL" } as const;
const FONTS = { heading: "Heading font", body: "Text font", sans: "Sans serif", serif: "Serif", mono: "Monospace" } as const;
const WEIGHTS = { "400": "Regular", "500": "Medium", "600": "Semi-bold", "700": "Bold", "800": "Extra bold" } as const;
const CASES = { normal: "As typed", upper: "ALL CAPS" } as const;

/** Colour, size, font, weight, italic and capitals for one element of a section. */
export default function ElementStyleFields({
  id,
  value,
  onChange,
  palette,
}: {
  id: string;
  value: ElementStyle;
  onChange: (next: ElementStyle) => void;
  palette: ThemePalette;
}) {
  const samples = useFontSamples();
  function set<K extends keyof ElementStyle>(key: K, v: ElementStyle[K] | undefined) {
    const next: ElementStyle = { ...value };
    if (v === undefined) delete next[key];
    else next[key] = v;
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <ColourField label="Colour" value={value.colour} onChange={(v) => set("colour", v)} palette={palette} noneLabel="Section default" />
      <ColourField label="Hover colour (linked text)" value={value.hoverColour} onChange={(v) => set("hoverColour", v)} palette={palette} noneLabel="Section default" />
      <div className="grid grid-cols-2 gap-2">
        <SiteStyleSelect id={`${id}-size`} label="Size" options={ELEMENT_SIZES} labels={SIZES} value={value.size} onChange={(v) => set("size", v)} />
        <SiteStyleSelect id={`${id}-font`} label="Font" options={ELEMENT_FONTS} labels={FONTS} value={value.font} onChange={(v) => set("font", v)} />
        <SiteStyleSelect id={`${id}-weight`} label="Weight" options={ELEMENT_WEIGHTS} labels={WEIGHTS} value={value.weight} onChange={(v) => set("weight", v)} />
        <SiteStyleSelect id={`${id}-case`} label="Capitals" options={ELEMENT_CASES} labels={CASES} value={value.textCase} onChange={(v) => set("textCase", v)} />
      </div>
      {value.font ? <FontSamplePreview sample={samples.choice(value.font)} /> : null}
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={Boolean(value.italic)} onChange={(e) => set("italic", e.target.checked || undefined)} />
        Italic
      </label>
    </div>
  );
}
