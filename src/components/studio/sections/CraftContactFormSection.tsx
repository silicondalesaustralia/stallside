"use client";

import { useNode } from "@craftjs/core";
import CraftSectionChrome from "@/components/craft/CraftSectionChrome";
import StudioContactFormBlock from "@/components/studio/blocks/StudioContactFormBlock";
import { useStudioMetadata } from "@/components/studio/StudioEditorContext";
import { parseContactLayout, type ContactFormLayout } from "@/lib/studio/contact-form";
import type { StudioMetadata } from "@/lib/studio/types";

export type CraftContactFormProps = {
  heading: string;
  body: string;
  buttonLabel: string;
  layout: ContactFormLayout;
  showPhone: boolean;
};

export default function CraftContactFormSection(props: CraftContactFormProps) {
  const { connectors: { connect, drag } } = useNode();
  const metadata = useStudioMetadata() as StudioMetadata;
  return (
    <div ref={(dom) => { if (dom) connect(drag(dom)); }}>
      <CraftSectionChrome>
        <StudioContactFormBlock
          heading={props.heading}
          body={props.body}
          buttonLabel={props.buttonLabel}
          layout={parseContactLayout(props.layout)}
          showPhone={props.showPhone !== false}
          standId={metadata.standId}
          editable
        />
      </CraftSectionChrome>
    </div>
  );
}

CraftContactFormSection.craft = {
  displayName: "CraftContactFormSection",
  props: {
    heading: "Get in touch",
    body: "Questions about an order, pickup or our products? Send us a message and we'll reply by email.",
    buttonLabel: "Send message",
    layout: "stacked",
    showPhone: true,
  },
  rules: { canDrag: () => true, canMoveIn: () => false },
};
