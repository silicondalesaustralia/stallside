"use client";

import RichText from "@/components/studio/RichText";
import SectionElement from "@/components/studio/SectionElement";
import { useElementCss } from "@/components/studio/SectionStyleContext";

/** Product description; its bullet lines take the "Description bullet points" style. */
export default function ProductDescription({ value }: { value: string }) {
  const listStyle = useElementCss("descriptionList");
  return (
    <SectionElement el="description" as="div" className="mt-4 text-lg leading-relaxed text-[var(--muted)]">
      <RichText value={value} listStyle={listStyle} />
    </SectionElement>
  );
}
