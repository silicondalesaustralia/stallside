"use client";

import { fontChoiceSample, siteFontSample, type FontSample } from "@/lib/storefront/font-sample";
import type { ElementFont } from "@/lib/website/sections/element-style";
import { useStudioEditorChrome, useStudioMetadata } from "./StudioEditorContext";

/** The live site-wide fonts, so a picker can preview what a choice will look like. */
export function useFontSamples(): {
  site: (role: "heading" | "body") => FontSample;
  choice: (font: ElementFont) => FontSample;
} {
  const fontPairId = useStudioMetadata().resolvedBranding.fontPairId;
  const { siteStyle = {} } = useStudioEditorChrome();
  return {
    site: (role) => siteFontSample(role, siteStyle, fontPairId),
    choice: (font) => fontChoiceSample(font, siteStyle, fontPairId),
  };
}
