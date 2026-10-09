"use client";

import type { WebsiteBlueprint } from "@/lib/website/blueprints";
import type { DemoKit } from "@/lib/website/demo-kits";
import { resolveKitText } from "@/lib/website/demo-kits";
import {
  MerchAvailableNow,
  MerchGalleryProcess,
  MerchStoryMenu,
} from "./DemoMerchStory";
import {
  MerchCategoryRows,
  MerchColourBlocks,
  MerchCurated,
  MerchDenseGrid,
  MerchFeatureRows,
  MerchLargeGrid,
  MerchTabbed,
} from "./DemoMerchGrids";

type Props = {
  blueprint: WebsiteBlueprint;
  kit: DemoKit;
  businessName: string;
  expanded?: boolean;
};

export default function DemoMerch({ blueprint, kit, businessName, expanded }: Props) {
  const aboutShort = resolveKitText(kit.copy.about.short, businessName);
  const aboutHeading = resolveKitText(kit.copy.about.heading, businessName);
  const showCount = expanded ? 8 : 6;
  const shared = { kit, aboutHeading, aboutShort, showCount };
  const merch = blueprint.layout.merch;

  switch (merch) {
    case "STORY_COLUMNS_MENU_LIST":
      return <MerchStoryMenu {...shared} />;
    case "AVAILABLE_NOW":
      return <MerchAvailableNow {...shared} />;
    case "GALLERY_PROCESS":
      return <MerchGalleryProcess {...shared} />;
    case "COLOUR_BLOCKS_GRID_4":
      return <MerchColourBlocks {...shared} />;
    case "DENSE_GRID_6":
      return <MerchDenseGrid {...shared} />;
    case "CURATED_SETS":
      return <MerchCurated {...shared} />;
    case "CATEGORY_ROWS":
      return <MerchCategoryRows {...shared} />;
    case "TABBED_GRID_4":
      return <MerchTabbed {...shared} />;
    case "LARGE_GRID_2":
      return <MerchLargeGrid {...shared} />;
    default:
      return <MerchFeatureRows {...shared} />;
  }
}
