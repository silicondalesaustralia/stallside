"use client";

import { createElement, type ReactNode } from "react";
import { useElementCss } from "./SectionStyleContext";

type Tag = "p" | "div" | "span" | "ul" | "summary";

/** A named part of a section (price, bullet points…) that takes the seller's colour, size and font for it. */
export default function SectionElement({
  el,
  as = "p",
  className,
  children,
}: {
  el: string;
  as?: Tag;
  className?: string;
  children: ReactNode;
}) {
  const css = useElementCss(el);
  return createElement(
    as,
    { className, style: css, "data-el": el, ...(css?.fontSize ? { "data-el-sized": "" } : {}) },
    children,
  );
}
