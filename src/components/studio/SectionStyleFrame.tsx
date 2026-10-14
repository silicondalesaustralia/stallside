"use client";

import { useMemo, type ReactNode } from "react";
import type { SectionStyle } from "@/lib/website/sections/section-style";
import type { ThemePalette } from "@/lib/website/sections/colour";
import { sectionStyleFrame } from "@/lib/website/sections/section-style-frame";
import { SectionStyleContext } from "./SectionStyleContext";
import { isButtonLink } from "@/lib/studio/button-link";

/** Applies a section's colour and typography settings; used by the editor and the live site. */
export default function SectionStyleFrame({
  sectionStyle,
  palette,
  buttonLink,
  children,
}: {
  sectionStyle: SectionStyle;
  palette: ThemePalette;
  buttonLink?: unknown;
  children: ReactNode;
}) {
  const { headingTag } = sectionStyle;
  const link = isButtonLink(buttonLink) ? buttonLink : undefined;
  const context = useMemo(() => ({ headingTag, buttonLink: link }), [headingTag, link]);
  const attrs = sectionStyleFrame(sectionStyle, palette);
  return (
    <SectionStyleContext.Provider value={context}>
      <div {...attrs}>{children}</div>
    </SectionStyleContext.Provider>
  );
}
