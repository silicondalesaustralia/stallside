"use client";

import { useNode } from "@craftjs/core";
import CraftSectionChrome from "@/components/craft/CraftSectionChrome";
import StudioCategoriesBlock from "@/components/studio/blocks/StudioCategoriesBlock";
import { useStudioMetadata } from "@/components/studio/StudioEditorContext";
import type { CategoryPreset } from "@/lib/studio/preset-registry";
import { parseCategoryCardBackground, type CategoryCardBackground } from "@/lib/studio/category-looks";

export type CraftCategoriesProps = {
  source: "all" | "selected";
  categoryIds: string[];
  preset: CategoryPreset;
  heading: string;
  /** Shown under the heading. */
  intro?: string;
  showDescriptions?: boolean;
  /** Each category's average star rating from approved product reviews. */
  showRatings?: boolean;
  /** "none" removes the white card fill on boxed styles. */
  cardBackground?: CategoryCardBackground;
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
          intro={props.intro ?? ""}
          showDescriptions={props.showDescriptions === true}
          showRatings={props.showRatings === true}
          cardBackground={parseCategoryCardBackground(props.cardBackground)}
          metadata={metadata}
          isEditing
          editable
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
    intro: "",
    showDescriptions: false,
    showRatings: true,
  },
  rules: { canDrag: () => true, canMoveIn: () => false },
};
