"use client";

import { useNode } from "@craftjs/core";
import CraftSectionChrome from "@/components/craft/CraftSectionChrome";
import StudioFaqBlock from "@/components/studio/blocks/StudioFaqBlock";
import { parseFaqItems, type FaqItem } from "@/lib/studio/faq-items";

export type CraftFaqProps = {
  heading: string;
  intro: string;
  items: FaqItem[];
  startOpen: boolean;
};

export default function CraftFaqSection(props: CraftFaqProps) {
  const { connectors: { connect, drag } } = useNode();
  return (
    <div ref={(dom) => { if (dom) connect(drag(dom)); }}>
      <CraftSectionChrome>
        <StudioFaqBlock
          heading={props.heading}
          intro={props.intro}
          items={parseFaqItems(props.items)}
          startOpen={props.startOpen}
          editable
        />
      </CraftSectionChrome>
    </div>
  );
}

CraftFaqSection.craft = {
  displayName: "CraftFaqSection",
  props: { heading: "Frequently asked questions", intro: "", items: [], startOpen: false },
  rules: { canDrag: () => true, canMoveIn: () => false },
};
