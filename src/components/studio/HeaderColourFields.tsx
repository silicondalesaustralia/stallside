"use client";

import { paletteOf } from "@/lib/website/sections/colour";
import { useStudioEditorChrome, useStudioMetadata } from "./StudioEditorContext";
import ColourField from "./ColourField";

/** Header bar background and text colour; saved with the site-wide style. */
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
    </>
  );
}
