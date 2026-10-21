"use client";

import { useNode } from "@craftjs/core";
import CraftSectionChrome from "@/components/craft/CraftSectionChrome";
import { useCraftMetadata } from "@/components/craft/CraftEditorContext";
import StudioSubscriptionBlock from "@/components/studio/blocks/StudioSubscriptionBlock";
import type { StudioMetadata } from "@/lib/studio/types";
import { offerPageView, SUBSCRIPTION_TOGGLES } from "@/lib/studio/offer-page-settings";

function isStudioMetadata(meta: unknown): meta is StudioMetadata {
  return Boolean(meta && typeof meta === "object" && "templateId" in meta);
}

export default function CraftSubscriptionSection(props: Record<string, unknown>) {
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
          <StudioSubscriptionBlock metadata={metadata} view={offerPageView(props, SUBSCRIPTION_TOGGLES)} isEditing />
        ) : (
          <p className="p-6 text-sm text-[var(--muted)]">Subscription or membership</p>
        )}
      </CraftSectionChrome>
    </div>
  );
}

CraftSubscriptionSection.craft = {
  displayName: "CraftSubscriptionSection",
  props: {},
  rules: {
    canDrag: () => true,
    canMoveIn: () => false,
    canDelete: () => false,
  },
};
