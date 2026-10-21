import { Element } from "@craftjs/core";
import type { ReactNode } from "react";
import type { CommercePageKind } from "./commerce-pages";
import type { StudioTemplateId } from "./types";
import { defaultProductPreset } from "./preset-registry";
import StudioPageRoot from "@/components/studio/sections/StudioPageRoot";
import CraftProductGridSection from "@/components/craft/sections/CraftProductGridSection";
import CraftCategoriesSection from "@/components/studio/sections/CraftCategoriesSection";
import CraftReviewsSection from "@/components/studio/sections/CraftReviewsSection";
import CraftPickupSection from "@/components/studio/sections/CraftPickupSection";
import CraftProductDetailSection from "@/components/studio/sections/CraftProductDetailSection";
import { DEFAULT_INFO_ROWS } from "@/lib/studio/product-detail-settings";
import CraftCategoryDetailSection from "@/components/studio/sections/CraftCategoryDetailSection";
import CraftMenuDetailSection from "@/components/studio/sections/CraftMenuDetailSection";
import CraftCartSection from "@/components/studio/sections/CraftCartSection";
import CraftPreOrderSection from "@/components/studio/sections/CraftPreOrderSection";
import CraftSubscriptionSection from "@/components/studio/sections/CraftSubscriptionSection";
import CraftPreOrderListSection from "@/components/studio/sections/CraftPreOrderListSection";
import CraftSubscriptionListSection from "@/components/studio/sections/CraftSubscriptionListSection";
import CraftOrderConfirmationSection from "@/components/studio/sections/CraftOrderConfirmationSection";

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
      sections.push(<CraftCategoryDetailSection showTitle showTopDescription showBottomDescription columns={3} />);
      break;
    case "product":
      sections.push(
        <CraftProductDetailSection showReviews={false} showBackLink layout="classic" infoRows={DEFAULT_INFO_ROWS} />,
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
    case "preorders":
      sections.push(<CraftPreOrderListSection />);
      break;
    case "subscriptions":
      sections.push(<CraftSubscriptionListSection />);
      break;
    case "preorder":
      sections.push(<CraftPreOrderSection />);
      break;
    case "subscription":
      sections.push(<CraftSubscriptionSection />);
      break;
    case "cart":
      sections.push(<CraftCartSection />);
      break;
    case "success":
      sections.push(<CraftOrderConfirmationSection />);
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
