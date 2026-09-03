"use client";

import { useNode } from "@craftjs/core";
import CraftSectionChrome from "@/components/craft/CraftSectionChrome";
import { useCraftMetadata } from "@/components/craft/CraftEditorContext";
import StudioMenuDetailBlock from "@/components/studio/blocks/StudioMenuDetailBlock";
import type { StudioMetadata } from "@/lib/studio/types";

function isStudioMetadata(meta: unknown): meta is StudioMetadata {
  return Boolean(meta && typeof meta === "object" && "templateId" in meta);
}

export default function CraftMenuDetailSection() {
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
          <StudioMenuDetailBlock metadata={metadata} isEditing />
        ) : (
          <p className="p-6 text-sm text-[var(--muted)]">Menu detail</p>
        )}
      </CraftSectionChrome>
    </div>
  );
}

CraftMenuDetailSection.craft = {
  displayName: "CraftMenuDetailSection",
  props: {},
  rules: {
    canDrag: () => true,
    canMoveIn: () => false,
    canDelete: () => false,
  },
};
