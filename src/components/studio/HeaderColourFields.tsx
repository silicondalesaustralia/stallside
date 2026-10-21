"use client";

import { paletteOf } from "@/lib/website/sections/colour";
import { useStudioEditorChrome, useStudioMetadata } from "./StudioEditorContext";
import ColourField from "./ColourField";

/** Header bar and dropdown menu colours; saved with the site-wide style. */
export default function HeaderColourFields() {
  const { siteStyle = {}, setSiteStyleField } = useStudioEditorChrome();
  const palette = paletteOf(useStudioMetadata().resolvedBranding);
  const set = setSiteStyleField ?? (() => undefined);
  return (
    <>
      <ColourField
        label="Background colour"
        value={siteStyle.headerBackground}
        onChange={(v) => set("headerBackground", v)}
        palette={palette}
        noneLabel="Template default"
      />
      <ColourField
        label="Text colour"
        value={siteStyle.headerText}
        onChange={(v) => set("headerText", v)}
        palette={palette}
        noneLabel={siteStyle.headerBackground ? "Auto (readable on the background)" : "Template default"}
      />
      <p className="pt-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Dropdown menus</p>
      <ColourField
        label="Dropdown background"
        value={siteStyle.dropdownBackground}
        onChange={(v) => set("dropdownBackground", v)}
        palette={palette}
        noneLabel="Same as the header"
      />
      <ColourField
        label="Dropdown text colour"
        value={siteStyle.dropdownText}
        onChange={(v) => set("dropdownText", v)}
        palette={palette}
        noneLabel={siteStyle.dropdownBackground ? "Auto (readable on the dropdown)" : "Same as the header"}
      />
      <ColourField
        label="Hover background"
        value={siteStyle.dropdownHoverBackground}
        onChange={(v) => set("dropdownHoverBackground", v)}
        palette={palette}
        noneLabel="Light tint of the text colour"
      />
      <ColourField
        label="Hover text colour"
        value={siteStyle.dropdownHoverText}
        onChange={(v) => set("dropdownHoverText", v)}
        palette={palette}
        noneLabel={siteStyle.dropdownHoverBackground ? "Auto (readable on the hover colour)" : "Same as the dropdown text"}
      />
    </>
  );
}
