"use client";

import { useNode } from "@craftjs/core";
import CraftSectionChrome from "@/components/craft/CraftSectionChrome";
import StudioCategoriesBlock from "@/components/studio/blocks/StudioCategoriesBlock";
import { useStudioMetadata } from "@/components/studio/StudioEditorContext";
import type { CategoryPreset } from "@/lib/studio/preset-registry";

export type CraftCategoriesProps = {
  source: "all" | "selected";
  categoryIds: string[];
  preset: CategoryPreset;
  heading: string;
  /** @deprecated use preset */
  layout?: CategoryPreset;
};

export default function CraftCategoriesSection(props: CraftCategoriesProps) {
  const { connectors: { connect, drag } } = useNode();
  const metadata = useStudioMetadata();
  const preset = props.preset ?? props.layout ?? "tiles";

  return (
    <div ref={(dom) => { if (dom) connect(drag(dom)); }}>
      <CraftSectionChrome>
        <StudioCategoriesBlock
          source={props.source}
          categoryIds={props.categoryIds}
          preset={preset}
          heading={props.heading}
          metadata={metadata}
          isEditing
        />
      </CraftSectionChrome>
    </div>
  );
}

CraftCategoriesSection.craft = {
  displayName: "CraftCategoriesSection",
  props: {
    source: "all",
    categoryIds: [] as string[],
    preset: "tiles",
    heading: "Browse categories",
  },
  rules: { canDrag: () => true, canMoveIn: () => false },
};
