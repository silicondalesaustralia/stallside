"use client";

import { useNode } from "@craftjs/core";
import PuckUpcomingMenusBlock from "@/components/puck/blocks/PuckUpcomingMenusBlock";
import StudioNextDropBlock from "@/components/studio/blocks/StudioNextDropBlock";
import CraftSectionChrome from "../CraftSectionChrome";
import { useCraftMetadata } from "../CraftEditorContext";
import type { StudioMetadata } from "@/lib/studio/types";
import type { NextDropPreset } from "@/lib/studio/preset-registry";

export type CraftNextDropProps = {
  maxItems: number;
  showClosingDate: boolean;
  showPickupDate: boolean;
  preset: NextDropPreset;
  heading: string;
  /** @deprecated use preset */
  cardStyle?: "card" | "minimal";
};

function isStudioMetadata(meta: unknown): meta is StudioMetadata {
  return Boolean(meta && typeof meta === "object" && "templateId" in meta);
}

export default function CraftNextDropSection(props: CraftNextDropProps) {
  const { connectors: { connect, drag } } = useNode();
  const metadata = useCraftMetadata();

  return (
    <div ref={(dom) => { if (dom) connect(drag(dom)); }}>
      <CraftSectionChrome>
        {isStudioMetadata(metadata) ? (
          <StudioNextDropBlock
            maxItems={props.maxItems}
            preset={props.preset}
            heading={props.heading}
            showClosingDate={props.showClosingDate}
            showPickupDate={props.showPickupDate}
            metadata={metadata}
            isEditing
          />
        ) : (
          <PuckUpcomingMenusBlock
            maxItems={props.maxItems}
            showClosingDate={props.showClosingDate}
            cardStyle={props.cardStyle ?? "card"}
            puck={{ metadata }}
          />
        )}
      </CraftSectionChrome>
    </div>
  );
}

CraftNextDropSection.craft = {
  displayName: "CraftNextDropSection",
  props: {
    maxItems: 3,
    showClosingDate: true,
    showPickupDate: true,
    preset: "featured",
    heading: "Next bake",
  },
  rules: { canDrag: () => true, canMoveIn: () => false },
};
