"use client";

import { createContext, useContext } from "react";
import type { HeadingTag } from "@/lib/website/sections/section-style";
import { sectionText, type SectionTexts } from "@/lib/studio/section-texts";

export const SectionStyleContext = createContext<{
  headingTag?: HeadingTag;
  buttonLink?: string;
  texts?: SectionTexts;
  /** True inside the builder canvas, where fixed wording is click-to-edit. */
  editable?: boolean;
}>({});

/** The seller's heading level for the section being rendered, if they changed it. */
export function useSectionHeadingTag(): HeadingTag | undefined {
  return useContext(SectionStyleContext).headingTag;
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
