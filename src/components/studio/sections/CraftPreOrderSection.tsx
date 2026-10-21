"use client";

import { useNode } from "@craftjs/core";
import CraftSectionChrome from "@/components/craft/CraftSectionChrome";
import { useCraftMetadata } from "@/components/craft/CraftEditorContext";
import StudioPreOrderBlock from "@/components/studio/blocks/StudioPreOrderBlock";
import type { StudioMetadata } from "@/lib/studio/types";

function isStudioMetadata(meta: unknown): meta is StudioMetadata {
  return Boolean(meta && typeof meta === "object" && "templateId" in meta);
}

export default function CraftPreOrderSection() {
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
          <StudioPreOrderBlock metadata={metadata} isEditing />
        ) : (
          <p className="p-6 text-sm text-[var(--muted)]">Pre-order page</p>
        )}
      </CraftSectionChrome>
    </div>
  );
}

CraftPreOrderSection.craft = {
  displayName: "CraftPreOrderSection",
  props: {},
  rules: {
    canDrag: () => true,
    canMoveIn: () => false,
    canDelete: () => false,
  },
};
