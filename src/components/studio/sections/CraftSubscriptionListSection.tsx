"use client";

import { useNode } from "@craftjs/core";
import CraftSectionChrome from "@/components/craft/CraftSectionChrome";
import { useCraftMetadata } from "@/components/craft/CraftEditorContext";
import StudioSubscriptionListBlock from "@/components/studio/blocks/StudioSubscriptionListBlock";
import type { StudioMetadata } from "@/lib/studio/types";
import { LIST_TOGGLES, offerPageView } from "@/lib/studio/offer-page-settings";

function isStudioMetadata(meta: unknown): meta is StudioMetadata {
  return Boolean(meta && typeof meta === "object" && "templateId" in meta);
}

export default function CraftSubscriptionListSection(props: Record<string, unknown>) {
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
          <StudioSubscriptionListBlock metadata={metadata} view={offerPageView(props, LIST_TOGGLES)} />
        ) : (
          <p className="p-6 text-sm text-[var(--muted)]">Subscriptions & memberships category</p>
        )}
      </CraftSectionChrome>
    </div>
  );
}

CraftSubscriptionListSection.craft = {
  displayName: "CraftSubscriptionListSection",
  props: {},
  rules: {
    canDrag: () => true,
    canMoveIn: () => false,
    canDelete: () => false,
  },
};
