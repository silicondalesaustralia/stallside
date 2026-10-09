"use client";

import { useNode } from "@craftjs/core";
import CraftSectionChrome from "@/components/craft/CraftSectionChrome";
import StudioImageBlock from "@/components/studio/blocks/StudioImageBlock";

export type CraftImageProps = {
  imageUrl: string;
  alt: string;
  caption: string;
  layout: "full" | "contained" | "wide";
};

export default function CraftImageSection(props: CraftImageProps) {
  const { connectors: { connect, drag } } = useNode();
  return (
    <div ref={(dom) => { if (dom) connect(drag(dom)); }}>
      <CraftSectionChrome>
        <StudioImageBlock {...props} imageUrl={props.imageUrl || null} />
      </CraftSectionChrome>
    </div>
  );
}

CraftImageSection.craft = {
  displayName: "CraftImageSection",
  props: { imageUrl: "", alt: "", caption: "", layout: "contained" },
  rules: { canDrag: () => true, canMoveIn: () => false },
};
