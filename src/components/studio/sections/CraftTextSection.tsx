"use client";

import { useNode } from "@craftjs/core";
import CraftSectionChrome from "@/components/craft/CraftSectionChrome";
import StudioTextBlock from "@/components/studio/blocks/StudioTextBlock";

export type CraftTextProps = {
  heading: string;
  body: string;
  alignment: "left" | "centre";
};

export default function CraftTextSection(props: CraftTextProps) {
  const { connectors: { connect, drag } } = useNode();
  return (
    <div ref={(dom) => { if (dom) connect(drag(dom)); }}>
      <CraftSectionChrome>
        <StudioTextBlock {...props} />
      </CraftSectionChrome>
    </div>
  );
}

CraftTextSection.craft = {
  displayName: "CraftTextSection",
  props: { heading: "", body: "", alignment: "left" },
  rules: { canDrag: () => true, canMoveIn: () => false },
};
