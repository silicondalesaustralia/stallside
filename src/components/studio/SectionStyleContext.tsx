"use client";

import { createContext, useContext } from "react";
import type { HeadingTag } from "@/lib/website/sections/section-style";

export const SectionStyleContext = createContext<{ headingTag?: HeadingTag; buttonLink?: string }>({});

/** The seller's heading level for the section being rendered, if they changed it. */
export function useSectionHeadingTag(): HeadingTag | undefined {
  return useContext(SectionStyleContext).headingTag;
}

/** The section's stored button link token (see `resolveButtonLink`), if the seller set one. */
export function useSectionButtonLink(): string | undefined {
  return useContext(SectionStyleContext).buttonLink;
}
