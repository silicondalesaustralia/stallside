"use client";

import { useStudioMetadata, useStudioEditorChrome } from "./StudioEditorContext";
import { paletteOf } from "@/lib/website/sections/colour";
import { BODY_SIZES, HEADING_SIZES, type BodySize, type HeadingSize } from "@/lib/website/sections/section-style";
import { SITE_FONTS } from "@/lib/storefront/site-fonts";
import ColourField from "./ColourField";

const INPUT = "w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm";
const SIZE_LABELS: Record<string, string> = { sm: "Small", md: "Medium", lg: "Large", xl: "Extra large" };
const KINDS = ["Serif", "Sans serif"] as const;

function FontSelect({ id, label, value, onChange }: { id: string; label: string; value?: string; onChange: (v?: string) => void }) {
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
    </div>
  );
}

/** Site-wide fonts, heading / text sizes and colours. Sections can still set their own. */
export default function SiteTypographySettings() {
  const palette = paletteOf(useStudioMetadata().resolvedBranding);
  const { siteStyle = {}, setSiteStyleField } = useStudioEditorChrome();
  const set = setSiteStyleField ?? (() => undefined);

  return (
    <div className="mt-6 space-y-4 border-t border-[var(--line)] pt-4">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">Fonts &amp; text</p>
      <FontSelect id="site-heading-font" label="Heading font" value={siteStyle.headingFont} onChange={(v) => set("headingFont", v)} />
      <FontSelect id="site-body-font" label="Text font" value={siteStyle.bodyFont} onChange={(v) => set("bodyFont", v)} />
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <label htmlFor="site-heading-size" className="block text-xs font-semibold text-[var(--field)]">Heading size</label>
          <select
            id="site-heading-size"
            className={INPUT}
            value={siteStyle.headingSize ?? ""}
            onChange={(e) => set("headingSize", (e.target.value || undefined) as HeadingSize | undefined)}
          >
            <option value="">Default</option>
            {HEADING_SIZES.map((s) => <option key={s} value={s}>{SIZE_LABELS[s]}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="site-body-size" className="block text-xs font-semibold text-[var(--field)]">Text size</label>
          <select
            id="site-body-size"
            className={INPUT}
            value={siteStyle.bodySize ?? ""}
            onChange={(e) => set("bodySize", (e.target.value || undefined) as BodySize | undefined)}
          >
            <option value="">Default</option>
            {BODY_SIZES.map((s) => <option key={s} value={s}>{SIZE_LABELS[s]}</option>)}
          </select>
        </div>
      </div>
      <ColourField
        label="Heading colour"
        value={siteStyle.headingColour}
        onChange={(v) => set("headingColour", v)}
        palette={palette}
        noneLabel="Template default"
      />
      <ColourField
        label="Text colour"
        value={siteStyle.textColour}
        onChange={(v) => set("textColour", v)}
        palette={palette}
        noneLabel="Template default"
      />
      <p className="text-xs text-[var(--muted)]">
        Applies to every page. A section&apos;s own colour or size settings still win.
      </p>
    </div>
  );
}
