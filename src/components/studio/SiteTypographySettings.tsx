"use client";

import { useStudioMetadata, useStudioEditorChrome } from "./StudioEditorContext";
import { paletteOf } from "@/lib/website/sections/colour";
import { BODY_SIZES, HEADING_SIZES } from "@/lib/website/sections/section-style";
import { HEADING_CASES, HEADING_TRACKINGS, HEADING_WEIGHTS } from "@/lib/storefront/site-style";
import { SITE_FONTS } from "@/lib/storefront/site-fonts";
import ColourField from "./ColourField";
import SiteStyleSelect from "./SiteStyleSelect";
import FontSamplePreview from "./FontSamplePreview";
import { useFontSamples } from "./useFontSamples";
import type { FontSample } from "@/lib/storefront/font-sample";

const INPUT = "w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm";
const SIZES = { sm: "Small", md: "Medium", lg: "Large", xl: "Extra large" } as const;
const WEIGHTS = { "400": "Regular", "500": "Medium", "600": "Semi-bold", "700": "Bold", "800": "Extra bold" } as const;
const CASES = { normal: "As typed", upper: "ALL CAPS" } as const;
const TRACKINGS = { tight: "Tight", normal: "Normal", wide: "Wide" } as const;
const KINDS = ["Serif", "Sans serif"] as const;

function FontSelect({ id, label, value, onChange, sample }: { id: string; label: string; value?: string; onChange: (v?: string) => void; sample: FontSample }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold text-[var(--field)]">{label}</label>
      <select id={id} className={INPUT} value={value ?? ""} onChange={(e) => onChange(e.target.value || undefined)}>
        <option value="">Template default</option>
        {KINDS.map((kind) => (
          <optgroup key={kind} label={kind}>
            {SITE_FONTS.filter((f) => f.kind === kind).map((f) => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </optgroup>
        ))}
      </select>
      <FontSamplePreview sample={sample} />
    </div>
  );
}

/** Site-wide fonts, heading style, sizes and colours. Sections can still set their own. */
export default function SiteTypographySettings() {
  const palette = paletteOf(useStudioMetadata().resolvedBranding);
  const { siteStyle = {}, setSiteStyleField } = useStudioEditorChrome();
  const set = setSiteStyleField ?? (() => undefined);
  const samples = useFontSamples();

  return (
    <div className="mt-6 space-y-4 border-t border-[var(--line)] pt-4">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">Fonts &amp; text</p>
      <FontSelect id="site-heading-font" label="Heading font" value={siteStyle.headingFont} onChange={(v) => set("headingFont", v)} sample={samples.site("heading")} />
      <FontSelect id="site-body-font" label="Text font" value={siteStyle.bodyFont} onChange={(v) => set("bodyFont", v)} sample={samples.site("body")} />
      <div className="grid grid-cols-2 gap-2">
        <SiteStyleSelect id="site-heading-size" label="Heading size" options={HEADING_SIZES} labels={SIZES} value={siteStyle.headingSize} onChange={(v) => set("headingSize", v)} />
        <SiteStyleSelect id="site-body-size" label="Text size" options={BODY_SIZES} labels={SIZES} value={siteStyle.bodySize} onChange={(v) => set("bodySize", v)} />
        <SiteStyleSelect id="site-heading-weight" label="Heading weight" options={HEADING_WEIGHTS} labels={WEIGHTS} value={siteStyle.headingWeight} onChange={(v) => set("headingWeight", v)} />
        <SiteStyleSelect id="site-heading-tracking" label="Letter spacing" options={HEADING_TRACKINGS} labels={TRACKINGS} value={siteStyle.headingTracking} onChange={(v) => set("headingTracking", v)} />
      </div>
      <SiteStyleSelect id="site-heading-case" label="Heading capitals" options={HEADING_CASES} labels={CASES} value={siteStyle.headingCase} onChange={(v) => set("headingCase", v)} />
      <ColourField label="Heading colour" value={siteStyle.headingColour} onChange={(v) => set("headingColour", v)} palette={palette} noneLabel="Template default" />
      <ColourField label="Content text colour" value={siteStyle.textColour} onChange={(v) => set("textColour", v)} palette={palette} noneLabel="Template default" />
      <p className="text-xs text-[var(--muted)]">Applies to every page. A section&apos;s own colour or size settings still win.</p>
    </div>
  );
}
