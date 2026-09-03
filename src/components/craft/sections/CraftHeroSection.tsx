"use client";

import { useNode } from "@craftjs/core";
import PuckHeroBlock from "@/components/puck/blocks/PuckHeroBlock";
import StudioHeroBlock from "@/components/studio/blocks/StudioHeroBlock";
import CraftSectionChrome from "../CraftSectionChrome";
import { useCraftMetadata } from "../CraftEditorContext";
import type { StudioMetadata } from "@/lib/studio/types";

export type CraftHeroProps = {
  headline: string;
  supportingText: string;
  layout: string;
  ctaLabel: string;
  showCta: boolean;
};

function isStudioMetadata(meta: unknown): meta is StudioMetadata {
  return Boolean(meta && typeof meta === "object" && "templateId" in meta);
}

export default function CraftHeroSection(props: CraftHeroProps) {
  const { connectors: { connect, drag } } = useNode();
  const metadata = useCraftMetadata();

  return (
    <div ref={(dom) => { if (dom) connect(drag(dom)); }}>
      <CraftSectionChrome>
        {isStudioMetadata(metadata) ? (
          <StudioHeroBlock
            {...props}
            layout={props.layout as import("@/lib/studio/preset-registry").HeroPreset}
            metadata={metadata}
            isEditing
          />
        ) : (
          <PuckHeroBlock
            {...props}
            layout={
              props.layout === "editorial" || props.layout === "minimal"
                ? "simple"
                : (props.layout as "simple" | "split" | "spotlight" | "background")
            }
            puck={{ metadata }}
          />
        )}
      </CraftSectionChrome>
    </div>
  );
}

CraftHeroSection.craft = {
  displayName: "CraftHeroSection",
  props: {
    headline: "",
    supportingText: "",
    layout: "background",
    ctaLabel: "Shop now",
    showCta: true,
  },
  rules: { canDrag: () => true, canMoveIn: () => false },
};
