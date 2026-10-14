"use client";

import { useNode } from "@craftjs/core";
import CraftSectionChrome from "@/components/craft/CraftSectionChrome";
import { useCraftMetadata } from "@/components/craft/CraftEditorContext";
import StudioCartBlock from "@/components/studio/blocks/StudioCartBlock";
import type { StudioMetadata } from "@/lib/studio/types";

function isStudioMetadata(meta: unknown): meta is StudioMetadata {
  return Boolean(meta && typeof meta === "object" && "templateId" in meta);
}

export default function CraftCartSection() {
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
          <StudioCartBlock metadata={metadata} isEditing />
        ) : (
          <p className="p-6 text-sm text-[var(--muted)]">Cart & checkout</p>
        )}
      </CraftSectionChrome>
    </div>
  );
}

CraftCartSection.craft = {
  displayName: "CraftCartSection",
  props: {},
  rules: {
    canDrag: () => true,
    canMoveIn: () => false,
    canDelete: () => false,
  },
};
