"use client";

import { createElement, type ReactNode } from "react";
import type { HeadingTag } from "@/lib/website/sections/section-style";
import { useSectionHeadingTag } from "./SectionStyleContext";

/** A section's main heading: the level the seller picked, else `defaultTag`. */
export default function SectionHeadingTag({
  defaultTag = "h2",
  className,
  children,
}: {
  defaultTag?: HeadingTag;
  className?: string;
  children: ReactNode;
}) {
  const tag = useSectionHeadingTag() ?? defaultTag;
  return createElement(tag, { className, "data-section-heading": "" }, children);
}
