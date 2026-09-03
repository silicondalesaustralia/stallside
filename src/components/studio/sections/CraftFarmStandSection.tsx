"use client";

import { useNode } from "@craftjs/core";
import CraftSectionChrome from "@/components/craft/CraftSectionChrome";
import { useStudioMetadata } from "@/components/studio/StudioEditorContext";
import StudioFarmStandBlock from "@/components/studio/blocks/StudioFarmStandBlock";
import type { StudioMetadata } from "@/lib/studio/types";

export type CraftFarmStandProps = {
  heading: string;
  showHours: boolean;
  showLocation: boolean;
  showDirections: boolean;
};

function isStudioMetadata(meta: unknown): meta is StudioMetadata {
  return Boolean(meta && typeof meta === "object" && "templateId" in meta);
}

export default function CraftFarmStandSection(props: CraftFarmStandProps) {
  const { connectors: { connect, drag } } = useNode();
  const metadata = useStudioMetadata();

  if (!isStudioMetadata(metadata)) {
    return (
      <div ref={(dom) => { if (dom) connect(drag(dom)); }}>
        <CraftSectionChrome>
          <p className="p-6 text-sm text-[var(--muted)]">Farm Stand section (Website Studio only)</p>
        </CraftSectionChrome>
      </div>
    );
  }

  return (
    <div ref={(dom) => { if (dom) connect(drag(dom)); }}>
      <CraftSectionChrome>
        <StudioFarmStandBlock {...props} metadata={metadata} isEditing />
      </CraftSectionChrome>
    </div>
  );
}

CraftFarmStandSection.craft = {
  displayName: "CraftFarmStandSection",
  props: {
    heading: "Visit the stand",
    showHours: true,
    showLocation: true,
    showDirections: true,
  },
  rules: { canDrag: () => true, canMoveIn: () => false },
};
