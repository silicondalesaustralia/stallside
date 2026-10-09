"use client";

import { createContext, useContext } from "react";
import type { HeadingTag } from "@/lib/website/sections/section-style";

export const SectionStyleContext = createContext<{ headingTag?: HeadingTag }>({});

/** The seller's heading level for the section being rendered, if they changed it. */
export function useSectionHeadingTag(): HeadingTag | undefined {
  return useContext(SectionStyleContext).headingTag;
}
