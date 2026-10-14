"use client";

import { createElement, type ReactNode } from "react";
import type { HeadingTag } from "@/lib/website/sections/section-style";
import { useElementCss, useSectionHeadingTag } from "./SectionStyleContext";

/** A section's main heading: the level the seller picked, else `defaultTag`. `el` names it for per-element styling. */
export default function SectionHeadingTag({
  defaultTag = "h2",
  el,
  className,
  children,
}: {
  defaultTag?: HeadingTag;
  el?: string;
  className?: string;
  children: ReactNode;
}) {
  const tag = useSectionHeadingTag() ?? defaultTag;
  const style = useElementCss(el);
  return createElement(tag, { className, style, "data-section-heading": "", ...(el ? { "data-el": el } : {}) }, children);
}
