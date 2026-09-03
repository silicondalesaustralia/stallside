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
  layout: "grid" | "list";
  columns: 2 | 3 | 4;
  preset: ProductPreset;
  heading: string;
  showPrice: boolean;
  showAvailability: boolean;
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
            heading={props.heading}
            showPrice={props.showPrice}
            showAvailability={props.showAvailability}
            metadata={metadata}
            isEditing
          />
        ) : (
          <PuckFeaturedProductsBlock
            source={props.source === "activeCategory" ? "all" : props.source}
            categoryId={props.categoryId}
            productIds={props.productIds}
            limit={props.limit}
            layout={props.layout}
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
    layout: "grid",
    columns: 3,
    preset: "editorial",
    heading: "Our bakes",
    showPrice: true,
    showAvailability: true,
  },
  rules: { canDrag: () => true, canMoveIn: () => false },
};
