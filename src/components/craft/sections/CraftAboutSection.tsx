"use client";

import { useNode } from "@craftjs/core";
import PuckAboutBlock from "@/components/puck/blocks/PuckAboutBlock";
import CraftSectionChrome from "../CraftSectionChrome";

export type CraftAboutProps = {
  heading: string;
  body: string;
  layout: "simple" | "card";
};

export default function CraftAboutSection(props: CraftAboutProps) {
  const { connectors: { connect, drag } } = useNode();

  return (
    <div ref={(dom) => { if (dom) connect(drag(dom)); }}>
      <CraftSectionChrome>
        <PuckAboutBlock {...props} />
      </CraftSectionChrome>
    </div>
  );
}

CraftAboutSection.craft = {
  displayName: "CraftAboutSection",
  props: {
    heading: "About us",
    body: "",
    layout: "simple",
  },
  rules: { canDrag: () => true, canMoveIn: () => false },
};
