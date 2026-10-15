"use client";

import { useNode } from "@craftjs/core";
import PuckFeaturedProductsBlock from "@/components/puck/blocks/PuckFeaturedProductsBlock";
import StudioProductsBlock from "@/components/studio/blocks/StudioProductsBlock";
import CraftSectionChrome from "../CraftSectionChrome";
import { useCraftMetadata } from "../CraftEditorContext";
import type { StudioMetadata } from "@/lib/studio/types";
import type { ProductPreset } from "@/lib/studio/preset-registry";

export type CraftProductGridProps = {
  source: "all" | "category" | "manual" | "activeCategory";
  categoryId: string;
  productIds: string[];
  limit: number;
  /** @deprecated Only read by the Puck prototype; Studio uses `preset`. */
  layout?: "grid" | "list";
  columns: 1 | 2 | 3 | 4;
  /** Where a 1-column list sits. */
  align?: "left" | "centre";
  preset: ProductPreset;
  heading: string;
  showPrice: boolean;
  showAvailability: boolean;
  /** Review stars on each card; off for sections saved before the option existed. */
  showRatings?: boolean;
  /** Category pages only: the category's name and description above the grid. */
  showCategoryIntro?: boolean;
};

function isStudioMetadata(meta: unknown): meta is StudioMetadata {
  return Boolean(meta && typeof meta === "object" && "templateId" in meta);
}

export default function CraftProductGridSection(props: CraftProductGridProps) {
  const { connectors: { connect, drag } } = useNode();
  const metadata = useCraftMetadata();

  return (
    <div ref={(dom) => { if (dom) connect(drag(dom)); }}>
      <CraftSectionChrome>
        {isStudioMetadata(metadata) ? (
          <StudioProductsBlock
            source={props.source}
            categoryId={props.categoryId}
            productIds={props.productIds}
            limit={props.limit}
            preset={props.preset}
            columns={props.columns}
            align={props.align}
            heading={props.heading}
            showPrice={props.showPrice}
            showAvailability={props.showAvailability}
            showRatings={props.showRatings === true}
            showCategoryIntro={props.showCategoryIntro !== false}
            metadata={metadata}
            isEditing
            editable
          />
        ) : (
          <PuckFeaturedProductsBlock
            source={props.source === "activeCategory" ? "all" : props.source}
            categoryId={props.categoryId}
            productIds={props.productIds}
            limit={props.limit}
            layout={props.layout ?? "grid"}
            columns={props.columns}
            showPrice={props.showPrice}
            showAvailability={props.showAvailability}
            puck={{ metadata, isEditing: true }}
          />
        )}
      </CraftSectionChrome>
    </div>
  );
}

CraftProductGridSection.craft = {
  displayName: "CraftProductGridSection",
  props: {
    source: "all",
    categoryId: "",
    productIds: [] as string[],
    limit: 8,
    columns: 3,
    preset: "editorial",
    heading: "Our bakes",
    showPrice: true,
    showAvailability: true,
    showRatings: true,
  },
  rules: { canDrag: () => true, canMoveIn: () => false },
};
