"use client";

import { useMemo, type ReactNode } from "react";
import type { SectionStyle } from "@/lib/website/sections/section-style";
import type { ThemePalette } from "@/lib/website/sections/colour";
import { sectionStyleFrame } from "@/lib/website/sections/section-style-frame";
import { elementCssMap } from "@/lib/website/sections/element-style";
import { SectionStyleContext } from "./SectionStyleContext";
import { isButtonLink } from "@/lib/studio/button-link";
import { parseSectionTexts } from "@/lib/studio/section-texts";

/** Applies a section's colour and typography settings; used by the editor and the live site. */
export default function SectionStyleFrame({
  sectionStyle,
  palette,
  buttonLink,
  texts: rawTexts,
  editable = false,
  children,
}: {
  sectionStyle: SectionStyle;
  palette: ThemePalette;
  buttonLink?: unknown;
  texts?: unknown;
  editable?: boolean;
  children: ReactNode;
}) {
  const { headingTag, elements: elementStyles } = sectionStyle;
  const link = isButtonLink(buttonLink) ? buttonLink : undefined;
  const texts = useMemo(() => parseSectionTexts(rawTexts), [rawTexts]);
  const elements = useMemo(() => elementCssMap(elementStyles, palette), [elementStyles, palette]);
  const context = useMemo(
    () => ({ headingTag, elements, buttonLink: link, texts, editable }),
    [headingTag, elements, link, texts, editable],
  );
  const attrs = sectionStyleFrame(sectionStyle, palette);
  return (
    <SectionStyleContext.Provider value={context}>
      <div {...attrs}>{children}</div>
    </SectionStyleContext.Provider>
  );
}
