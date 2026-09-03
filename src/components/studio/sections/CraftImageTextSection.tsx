"use client";

import { useNode } from "@craftjs/core";
import CraftSectionChrome from "@/components/craft/CraftSectionChrome";
import StudioImageTextBlock from "@/components/studio/blocks/StudioImageTextBlock";

export type CraftImageTextProps = {
  imageUrl: string;
  heading: string;
  body: string;
  layout: "image-left" | "image-right" | "editorial";
  ctaLabel: string;
};

export default function CraftImageTextSection(props: CraftImageTextProps) {
  const { connectors: { connect, drag } } = useNode();
  return (
    <div ref={(dom) => { if (dom) connect(drag(dom)); }}>
      <CraftSectionChrome>
        <StudioImageTextBlock {...props} imageUrl={props.imageUrl || null} />
      </CraftSectionChrome>
    </div>
  );
}

CraftImageTextSection.craft = {
  displayName: "CraftImageTextSection",
  props: {
    imageUrl: "",
    heading: "",
    body: "",
    layout: "image-left",
    ctaLabel: "",
  },
  rules: { canDrag: () => true, canMoveIn: () => false },
};
