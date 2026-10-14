"use client";

import { useNode } from "@craftjs/core";
import CraftSectionChrome from "@/components/craft/CraftSectionChrome";
import StudioPaymentsBlock, { type PaymentsLayout } from "@/components/studio/blocks/StudioPaymentsBlock";
import { useStudioMetadata } from "@/components/studio/StudioEditorContext";

export type CraftPaymentsProps = {
  heading: string;
  layout: PaymentsLayout;
  showLabels: boolean;
};

export default function CraftPaymentsSection(props: CraftPaymentsProps) {
  const { connectors: { connect, drag } } = useNode();
  const metadata = useStudioMetadata();
  return (
    <div ref={(dom) => { if (dom) connect(drag(dom)); }}>
      <CraftSectionChrome>
        <StudioPaymentsBlock {...props} brands={metadata.paymentBrands ?? []} editable />
      </CraftSectionChrome>
    </div>
  );
}

CraftPaymentsSection.craft = {
  displayName: "CraftPaymentsSection",
  props: {
    heading: "Ways to pay",
    layout: "slider",
    showLabels: false,
  },
  rules: { canDrag: () => true, canMoveIn: () => false },
};
