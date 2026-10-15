"use client";

import { useNode } from "@craftjs/core";
import CraftSectionChrome from "@/components/craft/CraftSectionChrome";
import { useCraftMetadata } from "@/components/craft/CraftEditorContext";
import StudioCategoryDetailBlock from "@/components/studio/blocks/StudioCategoryDetailBlock";
import type { StudioMetadata } from "@/lib/studio/types";
import { categoryDetailView, type CategoryDetailProps } from "@/lib/studio/category-detail-settings";

export type CraftCategoryDetailProps = CategoryDetailProps;

function isStudioMetadata(meta: unknown): meta is StudioMetadata {
  return Boolean(meta && typeof meta === "object" && "templateId" in meta);
}

export default function CraftCategoryDetailSection(props: CraftCategoryDetailProps) {
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
          <StudioCategoryDetailBlock view={categoryDetailView(props)} metadata={metadata} isEditing />
        ) : (
          <p className="p-6 text-sm text-[var(--muted)]">Category page</p>
        )}
      </CraftSectionChrome>
    </div>
  );
}

CraftCategoryDetailSection.craft = {
  displayName: "CraftCategoryDetailSection",
  props: {
    showTitle: true,
    showTopDescription: true,
    showBottomDescription: true,
    columns: 3,
  },
  rules: {
    canDrag: () => true,
    canMoveIn: () => false,
  },
};
