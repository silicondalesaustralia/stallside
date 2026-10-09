"use client";

import InlineEditableText from "@/components/studio/InlineEditableText";
import SectionHeadingTag from "@/components/studio/SectionHeadingTag";

/** Section h2 — click-to-edit in Craft when `editable`. */
export default function StudioSectionHeading({
  editable = false,
  value,
  fallback = "",
  className = "studio-heading",
  placeholder,
}: {
  editable?: boolean;
  value: string;
  fallback?: string;
  className?: string;
  placeholder?: string;
}) {
  if (editable) {
    return (
      <InlineEditableText
        prop="heading"
        value={value}
        as="h2"
        className={className}
        placeholder={placeholder || fallback || "Add a heading"}
      />
    );
  }
  return <SectionHeadingTag className={className}>{value || fallback}</SectionHeadingTag>;
}
