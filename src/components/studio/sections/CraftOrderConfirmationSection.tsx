"use client";

import { useNode } from "@craftjs/core";
import CraftSectionChrome from "@/components/craft/CraftSectionChrome";
import { useCraftMetadata } from "@/components/craft/CraftEditorContext";
import StudioOrderConfirmationBlock from "@/components/studio/blocks/StudioOrderConfirmationBlock";
import type { StudioMetadata } from "@/lib/studio/types";

export type CraftOrderConfirmationProps = {
  showRestock?: boolean;
};

function isStudioMetadata(meta: unknown): meta is StudioMetadata {
  return Boolean(meta && typeof meta === "object" && "templateId" in meta);
}

export default function CraftOrderConfirmationSection(props: CraftOrderConfirmationProps) {
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
          <StudioOrderConfirmationBlock metadata={metadata} showRestock={props.showRestock !== false} isEditing />
        ) : (
          <p className="p-6 text-sm text-[var(--muted)]">Order confirmation</p>
        )}
      </CraftSectionChrome>
    </div>
  );
}

CraftOrderConfirmationSection.craft = {
  displayName: "CraftOrderConfirmationSection",
  props: { showRestock: true },
  rules: {
    canDrag: () => true,
    canMoveIn: () => false,
    canDelete: () => false,
  },
};
