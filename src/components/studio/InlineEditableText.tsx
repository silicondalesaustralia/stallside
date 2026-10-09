"use client";

import { useSectionHeadingTag } from "./SectionStyleContext";
import EditableTextElement, { type TextTag } from "./EditableTextElement";

type Props = {
  prop: string;
  value: string;
  as?: TextTag;
  className?: string;
  multiline?: boolean;
  placeholder?: string;
};

/** Click-to-edit text bound to the current Craft node prop. */
export default function InlineEditableText({
  prop,
  value,
  as = "p",
  className = "",
  multiline = false,
  placeholder = "Click to edit",
}: Props) {
  // h1/h2 are a section's main heading; the seller's heading level replaces them.
  const isMainHeading = as === "h1" || as === "h2";
  const headingOverride = useSectionHeadingTag();
  return (
    <EditableTextElement
      prop={prop}
      value={value}
      as={isMainHeading && headingOverride ? headingOverride : as}
      sectionHeading={isMainHeading}
      className={className}
      multiline={multiline}
      placeholder={placeholder}
    />
  );
}
