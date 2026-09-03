"use client";

import { useNode } from "@craftjs/core";
import CraftSectionChrome from "@/components/craft/CraftSectionChrome";
import StudioPickupBlock from "@/components/studio/blocks/StudioPickupBlock";
import { useStudioMetadata } from "@/components/studio/StudioEditorContext";

import type { StudioMetadata } from "@/lib/studio/types";

export type CraftPickupProps = {
  preset: "simple" | "split" | "cards" | "visit-stand" | "info-band";
  heading: string;
};

export default function CraftPickupSection(props: CraftPickupProps) {
  const { connectors: { connect, drag } } = useNode();
  const metadata = useStudioMetadata() as StudioMetadata;

  return (
    <div ref={(dom) => { if (dom) connect(drag(dom)); }}>
      <CraftSectionChrome>
        <StudioPickupBlock {...props} metadata={metadata} isEditing />
      </CraftSectionChrome>
    </div>
  );
}

CraftPickupSection.craft = {
  displayName: "CraftPickupSection",
  props: { preset: "cards", heading: "Pickup & delivery" },
  rules: { canDrag: () => true, canMoveIn: () => false },
};
