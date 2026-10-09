"use client";

import { useNode } from "@craftjs/core";
import CraftSectionChrome from "@/components/craft/CraftSectionChrome";
import { useCraftMetadata } from "@/components/craft/CraftEditorContext";
import StudioProductDetailBlock from "@/components/studio/blocks/StudioProductDetailBlock";
import type { StudioMetadata } from "@/lib/studio/types";

export type CraftProductDetailProps = {
  showReviews: boolean;
  showBackLink: boolean;
};

function isStudioMetadata(meta: unknown): meta is StudioMetadata {
  return Boolean(meta && typeof meta === "object" && "templateId" in meta);
}

export default function CraftProductDetailSection(props: CraftProductDetailProps) {
  const {
    connectors: { connect, drag },
  } = useNode();
  const metadata = useCraftMetadata();

  return (
    <div
      ref={(dom) => {
        if (dom) connect(drag(dom));
      }}
    >
      <CraftSectionChrome>
        {isStudioMetadata(metadata) ? (
          <StudioProductDetailBlock
            showBackLink={props.showBackLink}
            metadata={metadata}
            isEditing
          />
        ) : (
          <p className="p-6 text-sm text-[var(--muted)]">Product detail</p>
        )}
      </CraftSectionChrome>
    </div>
  );
}

CraftProductDetailSection.craft = {
  displayName: "CraftProductDetailSection",
  props: {
    showReviews: true,
    showBackLink: true,
  },
  rules: {
    canDrag: () => true,
    canMoveIn: () => false,
    canDelete: () => false,
  },
};
