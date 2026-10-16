"use client";

import InlineEditableText from "@/components/studio/InlineEditableText";
import SectionHeadingTag from "@/components/studio/SectionHeadingTag";
import type { HeroView } from "./types";

/** The hero's h1: click-to-edit in the builder. */
export default function HeroTitle({
  view,
  className,
  placeholder,
  display,
}: {
  view: HeroView;
  className: string;
  placeholder?: string;
  /** Shown on the live site instead of the headline (e.g. a menu title). */
  display?: string;
}) {
  if (view.editable) {
    return (
      <InlineEditableText
        prop="headline"
        value={view.headline}
        as="h1"
        className={className}
        placeholder={placeholder || view.brandHeadline}
      />
    );
  }
  return (
    <SectionHeadingTag defaultTag="h1" className={className}>
      {display ?? view.title}
    </SectionHeadingTag>
  );
}
