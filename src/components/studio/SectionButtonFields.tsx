"use client";

import {
  BUTTON_FONTS,
  BUTTON_SIZES,
  type ButtonFont,
  type ButtonSize,
  type SectionStyle,
} from "@/lib/website/sections/section-style";
import { colourHex, hasLowContrast, type ThemePalette } from "@/lib/website/sections/colour";
import ColourField from "./ColourField";
import { useStudioEditorChrome } from "./StudioEditorContext";
import PillChoice from "./PillChoice";
import FontSamplePreview from "./FontSamplePreview";
import { useFontSamples } from "./useFontSamples";

const SIZE_LABELS: Record<ButtonSize, string> = { sm: "S", md: "M", lg: "L" };
const FONT_LABELS: Record<ButtonFont, string> = {
  heading: "Heading font",
  body: "Body font",
  sans: "Clean sans",
  serif: "Classic serif",
};

/** Size, text size, colours and font for the section's main button. */
export default function SectionButtonFields({
  style,
  palette,
  setField,
}: {
  style: SectionStyle;
  palette: ThemePalette;
  setField: <K extends keyof SectionStyle>(key: K, value: SectionStyle[K] | undefined) => void;
}) {
  const site = useStudioEditorChrome().siteButtonColours ?? { background: null, text: null };
  const samples = useFontSamples();
  const lowContrast =
    Boolean(style.buttonColour || style.buttonTextColour) &&
    hasLowContrast(
      { background: style.buttonColour ?? site.background ?? "accent", textColour: style.buttonTextColour },
      palette,
    );

  return (
    <div className="space-y-4">
      <PillChoice label="Button size" options={BUTTON_SIZES} labels={SIZE_LABELS} value={style.buttonSize} onChange={(v) => setField("buttonSize", v)} />
      <PillChoice label="Button text size" options={BUTTON_SIZES} labels={SIZE_LABELS} value={style.buttonTextSize} onChange={(v) => setField("buttonTextSize", v)} />
      <ColourField
        label="Button colour"
        value={style.buttonColour}
        onChange={(v) => setField("buttonColour", v)}
        palette={palette}
        noneLabel={site.background ? "Site default: the button colour set in Site Wide Edits" : "Site default: the template's button colour"}
        noneChip={{ text: "Site default", colour: site.background ? colourHex(site.background, palette) : null }}
      />
      <ColourField
        label="Button text colour"
        value={style.buttonTextColour}
        onChange={(v) => setField("buttonTextColour", v)}
        palette={palette}
        noneLabel={site.text ? "Site default: the button text colour set in Site Wide Edits" : "Auto (readable on the button)"}
        noneChip={{ text: site.text ? "Site default" : "Auto", colour: site.text ? colourHex(site.text, palette) : null }}
      />
      {lowContrast ? (
        <p className="text-xs text-red-700">The button text may be hard to read. Try Auto text colour.</p>
      ) : null}
      <PillChoice label="Button font" options={BUTTON_FONTS} labels={FONT_LABELS} value={style.buttonFont} onChange={(v) => setField("buttonFont", v)} />
      {style.buttonFont ? <FontSamplePreview sample={samples.choice(style.buttonFont)} /> : null}
    </div>
  );
}
