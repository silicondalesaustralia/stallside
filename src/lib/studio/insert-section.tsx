import { Element } from "@craftjs/core";
import type { ReactElement } from "react";
import type { StudioSectionType } from "./types";
import CraftHeroSection from "@/components/craft/sections/CraftHeroSection";
import CraftProductGridSection from "@/components/craft/sections/CraftProductGridSection";
import CraftNextDropSection from "@/components/craft/sections/CraftNextDropSection";
import CraftAboutSection from "@/components/craft/sections/CraftAboutSection";
import CraftCategoriesSection from "@/components/studio/sections/CraftCategoriesSection";
import CraftTextSection from "@/components/studio/sections/CraftTextSection";
import CraftFaqSection from "@/components/studio/sections/CraftFaqSection";
import CraftContactFormSection from "@/components/studio/sections/CraftContactFormSection";
import { newMenuId } from "./header-menu";
import CraftImageSection from "@/components/studio/sections/CraftImageSection";
import CraftImageTextSection from "@/components/studio/sections/CraftImageTextSection";
import CraftReviewsSection from "@/components/studio/sections/CraftReviewsSection";
import CraftPickupSection from "@/components/studio/sections/CraftPickupSection";
import CraftSignupSection from "@/components/studio/sections/CraftSignupSection";
import CraftFarmStandSection from "@/components/studio/sections/CraftFarmStandSection";
import CraftPaymentsSection from "@/components/studio/sections/CraftPaymentsSection";
import CraftProductDetailSection from "@/components/studio/sections/CraftProductDetailSection";
import { DEFAULT_INFO_ROWS } from "@/lib/studio/product-detail-settings";
import CraftCategoryDetailSection from "@/components/studio/sections/CraftCategoryDetailSection";
import CraftSpacerSection from "@/components/studio/sections/CraftSpacerSection";
import CraftMenuDetailSection from "@/components/studio/sections/CraftMenuDetailSection";
import CraftCartSection from "@/components/studio/sections/CraftCartSection";
import CraftPreOrderSection from "@/components/studio/sections/CraftPreOrderSection";
import CraftPreOrderListSection from "@/components/studio/sections/CraftPreOrderListSection";
import CraftSubscriptionListSection from "@/components/studio/sections/CraftSubscriptionListSection";
import CraftSubscriptionSection from "@/components/studio/sections/CraftSubscriptionSection";
import CraftOrderConfirmationSection from "@/components/studio/sections/CraftOrderConfirmationSection";

export function studioSectionElement(type: StudioSectionType): ReactElement {
  switch (type) {
    case "CraftHeroSection":
      return (
        <Element
          is={CraftHeroSection}
          headline=""
          supportingText=""
          layout="background"
          ctaLabel="Shop now"
          showCta
        />
      );
    case "CraftProductDetailSection":
      return (
        <Element is={CraftProductDetailSection} showReviews={false} showBackLink layout="classic" infoRows={DEFAULT_INFO_ROWS} />
      );
    case "CraftCategoryDetailSection":
      return <Element is={CraftCategoryDetailSection} showTitle showTopDescription showBottomDescription columns={3} />;
    case "CraftSpacerSection":
      return <Element is={CraftSpacerSection} height={48} />;
    case "CraftMenuDetailSection":
      return <Element is={CraftMenuDetailSection} />;
    case "CraftCartSection":
      return <Element is={CraftCartSection} />;
    case "CraftPreOrderListSection":
      return <Element is={CraftPreOrderListSection} />;
    case "CraftSubscriptionListSection":
      return <Element is={CraftSubscriptionListSection} />;
    case "CraftPreOrderSection":
      return <Element is={CraftPreOrderSection} />;
    case "CraftSubscriptionSection":
      return <Element is={CraftSubscriptionSection} />;
    case "CraftOrderConfirmationSection":
      return <Element is={CraftOrderConfirmationSection} />;
    case "CraftProductGridSection":
      return (
        <Element
          is={CraftProductGridSection}
          source="all"
          categoryId=""
          productIds={[]}
          limit={8}
          columns={3}
          preset="editorial"
          heading="Our bakes"
          showPrice
          showAvailability
        />
      );
    case "CraftCategoriesSection":
      return (
        <Element
          is={CraftCategoriesSection}
          source="all"
          categoryIds={[]}
          preset="tiles"
          heading="Browse categories"
        />
      );
    case "CraftNextDropSection":
      return (
        <Element
          is={CraftNextDropSection}
          maxItems={1}
          showClosingDate
          showPickupDate
          preset="featured"
          heading="Next bake"
        />
      );
    case "CraftTextSection":
      return (
        <Element is={CraftTextSection} heading="" body="" alignment="left" />
      );
    case "CraftFaqSection":
      return (
        <Element
          is={CraftFaqSection}
          heading="Frequently asked questions"
          intro=""
          items={[{ id: newMenuId(), question: "", answer: "" }]}
          startOpen={false}
        />
      );
    case "CraftContactFormSection":
      return (
        <Element
          is={CraftContactFormSection}
          heading="Get in touch"
          body="Questions about an order, pickup or our products? Send us a message and we'll reply by email."
          buttonLabel="Send message"
          layout="stacked"
          showPhone
        />
      );
    case "CraftImageSection":
      return (
        <Element
          is={CraftImageSection}
          imageUrl=""
          alt=""
          caption=""
          layout="contained"
        />
      );
    case "CraftImageTextSection":
      return (
        <Element
          is={CraftImageTextSection}
          imageUrl=""
          heading="Our story"
          body=""
          layout="image-left"
          ctaLabel=""
        />
      );
    case "CraftAboutSection":
      return (
        <Element
          is={CraftAboutSection}
          heading="About us"
          body=""
          layout="card"
        />
      );
    case "CraftReviewsSection":
      return (
        <Element
          is={CraftReviewsSection}
          preset="cards"
          heading="What customers say"
          maxItems={4}
        />
      );
    case "CraftPickupSection":
      return (
        <Element
          is={CraftPickupSection}
          preset="cards"
          heading="Pickup & delivery"
        />
      );
    case "CraftPaymentsSection":
      return <Element is={CraftPaymentsSection} heading="Ways to pay" layout="slider" showLabels={false} />;
    case "CraftSignupSection":
      return (
        <Element
          is={CraftSignupSection}
          heading="Stay in the loop"
          body="Be first to hear about the next bake."
          buttonLabel="Subscribe"
        />
      );
    case "CraftFarmStandSection":
      return (
        <Element
          is={CraftFarmStandSection}
          heading="Visit the stand"
          showHours
          showLocation
          showDirections
        />
      );
    default: {
      const _exhaustive: never = type;
      throw new Error(`Unknown section type: ${_exhaustive}`);
    }
  }
}
