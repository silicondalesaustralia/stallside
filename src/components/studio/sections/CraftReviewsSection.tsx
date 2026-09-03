"use client";

import { useNode } from "@craftjs/core";
import CraftSectionChrome from "@/components/craft/CraftSectionChrome";
import StudioReviewsBlock from "@/components/studio/blocks/StudioReviewsBlock";
import { useStudioMetadata } from "@/components/studio/StudioEditorContext";

import type { StudioMetadata } from "@/lib/studio/types";

export type CraftReviewsProps = {
  preset: "cards" | "quote" | "featured";
  heading: string;
  maxItems: number;
};

export default function CraftReviewsSection(props: CraftReviewsProps) {
  const { connectors: { connect, drag } } = useNode();
  const metadata = useStudioMetadata() as StudioMetadata;

  return (
    <div ref={(dom) => { if (dom) connect(drag(dom)); }}>
      <CraftSectionChrome>
        <StudioReviewsBlock {...props} metadata={metadata} isEditing />
      </CraftSectionChrome>
    </div>
  );
}

CraftReviewsSection.craft = {
  displayName: "CraftReviewsSection",
  props: { preset: "cards", heading: "What customers say", maxItems: 4 },
  rules: { canDrag: () => true, canMoveIn: () => false },
};
