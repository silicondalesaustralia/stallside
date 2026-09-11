"use client";

import InlineEditableText from "@/components/studio/InlineEditableText";

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
  return <h2 className={className}>{value || fallback}</h2>;
}
