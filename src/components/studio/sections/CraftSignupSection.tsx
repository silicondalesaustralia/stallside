"use client";

import { useNode } from "@craftjs/core";
import CraftSectionChrome from "@/components/craft/CraftSectionChrome";
import StudioSignupBlock from "@/components/studio/blocks/StudioSignupBlock";
import { useStudioMetadata } from "@/components/studio/StudioEditorContext";

import type { StudioMetadata } from "@/lib/studio/types";

export type CraftSignupProps = {
  heading: string;
  body: string;
  buttonLabel: string;
};

export default function CraftSignupSection(props: CraftSignupProps) {
  const { connectors: { connect, drag } } = useNode();
  const metadata = useStudioMetadata() as StudioMetadata;

  return (
    <div ref={(dom) => { if (dom) connect(drag(dom)); }}>
      <CraftSectionChrome>
        <StudioSignupBlock
          {...props}
          standId={metadata.standId}
          isEditing
        />
      </CraftSectionChrome>
    </div>
  );
}

CraftSignupSection.craft = {
  displayName: "CraftSignupSection",
  props: {
    heading: "Stay in the loop",
    body: "Be first to hear about the next bake and seasonal specials.",
    buttonLabel: "Subscribe",
  },
  rules: { canDrag: () => true, canMoveIn: () => false },
};
