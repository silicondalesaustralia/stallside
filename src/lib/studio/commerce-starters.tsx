import { Element } from "@craftjs/core";
import type { ReactNode } from "react";
import type { CommercePageKind } from "./commerce-pages";
import type { StudioTemplateId } from "./types";
import { defaultProductPreset } from "./preset-registry";
import StudioPageRoot from "@/components/studio/sections/StudioPageRoot";
import CraftProductGridSection from "@/components/craft/sections/CraftProductGridSection";
import CraftCategoriesSection from "@/components/studio/sections/CraftCategoriesSection";
import CraftTextSection from "@/components/studio/sections/CraftTextSection";
import CraftReviewsSection from "@/components/studio/sections/CraftReviewsSection";
import CraftPickupSection from "@/components/studio/sections/CraftPickupSection";
import CraftProductDetailSection from "@/components/studio/sections/CraftProductDetailSection";
import CraftMenuDetailSection from "@/components/studio/sections/CraftMenuDetailSection";

export function buildCommerceStarterTree(input: {
  kind: CommercePageKind;
  templateId: StudioTemplateId;
  headline: string;
}) {
  const productPreset = defaultProductPreset(input.templateId);
  const sections: ReactNode[] = [];

  switch (input.kind) {
    case "shop":
      sections.push(
        <CraftCategoriesSection
          source="all"
          categoryIds={[]}
          preset="tiles"
          heading="Browse"
        />,
      );
      sections.push(
        <CraftProductGridSection
          source="all"
          categoryId=""
          productIds={[]}
          limit={input.templateId === "market" ? 12 : 8}
          layout="grid"
          columns={input.templateId === "market" ? 4 : 3}
          preset={productPreset}
          heading={
            input.templateId === "farmhouse" ? "What's available" : "Shop"
          }
          showPrice
          showAvailability
        />,
      );
      break;
    case "category":
      sections.push(
        <CraftTextSection
          heading="Category"
          body="Products in this category appear below. The heading updates from the live category name when published."
          alignment="left"
        />,
      );
      sections.push(
        <CraftProductGridSection
          source="activeCategory"
          categoryId=""
          productIds={[]}
          limit={12}
          layout="grid"
          columns={3}
          preset={productPreset}
          heading="In this category"
          showPrice
          showAvailability
        />,
      );
      break;
    case "product":
      sections.push(
        <CraftProductDetailSection showReviews={false} showBackLink />,
      );
      sections.push(
        <CraftReviewsSection
          preset="cards"
          heading="What customers say"
          maxItems={4}
        />,
      );
      break;
    case "menu":
      sections.push(<CraftMenuDetailSection />);
      sections.push(
        <CraftPickupSection preset="cards" heading="Pickup & delivery" />,
      );
      break;
    default: {
      const _exhaustive: never = input.kind;
      throw new Error(`Unknown commerce kind: ${_exhaustive}`);
    }
  }

  return (
    <Element is={StudioPageRoot} canvas>
      {sections}
    </Element>
  );
}
