"use client";

import { createContext, useContext } from "react";
import type { HeadingTag } from "@/lib/website/sections/section-style";
import { sectionText, type SectionTexts } from "@/lib/studio/section-texts";
import type { ElementCss } from "@/lib/website/sections/element-style";

export const SectionStyleContext = createContext<{
  headingTag?: HeadingTag;
  /** Inline CSS for named elements (price, bullet points…), from the section's `elements` style. */
  elements?: Record<string, ElementCss>;
  buttonLink?: string;
  texts?: SectionTexts;
  /** True inside the builder canvas, where fixed wording is click-to-edit. */
  editable?: boolean;
}>({});

/** The seller's heading level for the section being rendered, if they changed it. */
export function useSectionHeadingTag(): HeadingTag | undefined {
  return useContext(SectionStyleContext).headingTag;
}

/** The seller's look for one named element in this section, if they set one. */
export function useElementCss(el: string | undefined): ElementCss | undefined {
  const elements = useContext(SectionStyleContext).elements;
  return el ? elements?.[el] : undefined;
}

/** The section's stored button link token (see `resolveButtonLink`), if the seller set one. */
export function useSectionButtonLink(): string | undefined {
  return useContext(SectionStyleContext).buttonLink;
}

/** A piece of the section's fixed wording: the seller's version, or the default. */
export function useSectionText(key: string, fallback: string): string {
  return sectionText(useContext(SectionStyleContext).texts, key, fallback);
}

export function useSectionCopyContext() {
  const { texts, editable } = useContext(SectionStyleContext);
  return { texts, editable: Boolean(editable) };
}
