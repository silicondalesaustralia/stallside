"use client";

import InlineRichText from "@/components/studio/InlineRichText";
import RichText from "@/components/studio/RichText";
import type { HeroView } from "./types";

/** The hero's supporting text: click-to-edit in the builder, hidden when empty on the live site. */
export default function HeroSubtitle({ view, className }: { view: HeroView; className: string }) {
  if (view.editable) {
    return (
      <InlineRichText prop="supportingText" value={view.supportingText} className={className} placeholder="Add supporting text" />
    );
  }
  if (!view.subtitle) return null;
  return <RichText value={view.subtitle} className={className} />;
}
