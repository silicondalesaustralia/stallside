"use client";

import { useNode } from "@craftjs/core";
import CraftSectionChrome from "@/components/craft/CraftSectionChrome";
import { useCraftMetadata } from "@/components/craft/CraftEditorContext";
import StudioPreOrderListBlock from "@/components/studio/blocks/StudioPreOrderListBlock";
import type { StudioMetadata } from "@/lib/studio/types";
import { offerPageView } from "@/lib/studio/offer-page-settings";

function isStudioMetadata(meta: unknown): meta is StudioMetadata {
  return Boolean(meta && typeof meta === "object" && "templateId" in meta);
}

export default function CraftPreOrderListSection(props: Record<string, unknown>) {
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
          <StudioPreOrderListBlock metadata={metadata} view={offerPageView(props, [])} />
        ) : (
          <p className="p-6 text-sm text-[var(--muted)]">Pre-orders category</p>
        )}
      </CraftSectionChrome>
    </div>
  );
}

CraftPreOrderListSection.craft = {
  displayName: "CraftPreOrderListSection",
  props: {},
  rules: {
    canDrag: () => true,
    canMoveIn: () => false,
    canDelete: () => false,
  },
};
