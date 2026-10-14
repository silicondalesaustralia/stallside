"use client";

import { FOOTER_BOTTOM_MAX, type FooterSettings } from "@/lib/studio/footer-settings";
import { paletteOf } from "@/lib/website/sections/colour";
import { useStudioMetadata } from "./StudioEditorContext";
import ColourField from "./ColourField";

const INPUT = "w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm";

/** The line at the very bottom of the footer, and the footer's colours. */
export default function FooterLookFields({
  footer,
  update,
}: {
  footer: FooterSettings;
  update: (patch: Partial<FooterSettings>) => void;
}) {
  const branding = useStudioMetadata().resolvedBranding;
  const palette = paletteOf(branding);

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-[var(--field)]">Bottom line</label>
        <input
          className={INPUT}
          maxLength={FOOTER_BOTTOM_MAX}
          placeholder={`© {year} ${branding.businessName}`}
          value={footer.bottomText ?? ""}
          onChange={(e) => update({ bottomText: e.target.value || undefined })}
        />
        <p className="text-xs text-[var(--muted)]">Type {"{year}"} to show the current year.</p>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={footer.showHomeLink !== false}
          onChange={(e) => update({ showHomeLink: e.target.checked })}
        />
        Show &ldquo;Home&rdquo; link after it
      </label>
      <ColourField
        label="Background"
        value={footer.background}
        onChange={(background) => update({ background })}
        palette={palette}
        noneLabel="Template default"
      />
      <ColourField
        label="Text colour"
        value={footer.textColour}
        onChange={(textColour) => update({ textColour })}
        palette={palette}
        noneLabel="Auto (best contrast)"
      />
    </div>
  );
}
