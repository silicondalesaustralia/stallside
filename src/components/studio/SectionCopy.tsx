"use client";

import { createElement } from "react";
import EditableTextElement, { type TextTag } from "./EditableTextElement";
import { useSectionCopyContext } from "./SectionStyleContext";
import { fillTextVars, sectionText } from "@/lib/studio/section-texts";

type Props = {
  /** Key under the section's `texts` prop. */
  k: string;
  fallback: string;
  as?: TextTag;
  className?: string;
  multiline?: boolean;
  /** Values for `{name}` placeholders; the builder shows the placeholders so they can be kept. */
  vars?: Record<string, string | number>;
};

/** A section's fixed wording (labels, badges, small print): click-to-edit in the builder. */
export default function SectionCopy({ k, fallback, as = "span", className = "", multiline = false, vars }: Props) {
  const { texts, editable } = useSectionCopyContext();
  const template = sectionText(texts, k, fallback);
  if (!editable) return createElement(as, { className: className || undefined }, fillTextVars(template, vars));
  return (
    <EditableTextElement
      prop={`texts.${k}`}
      value={template}
      as={as}
      sectionHeading={false}
      className={className}
      multiline={multiline}
      placeholder={fallback}
      defaultValue={fallback}
    />
  );
}
