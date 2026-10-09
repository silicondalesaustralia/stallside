import { Element } from "@craftjs/core";
import type { ReactElement } from "react";
import type { StudioSectionType } from "./types";
import CraftHeroSection from "@/components/craft/sections/CraftHeroSection";
import CraftProductGridSection from "@/components/craft/sections/CraftProductGridSection";
import CraftNextDropSection from "@/components/craft/sections/CraftNextDropSection";
import CraftAboutSection from "@/components/craft/sections/CraftAboutSection";
import CraftCategoriesSection from "@/components/studio/sections/CraftCategoriesSection";
import CraftTextSection from "@/components/studio/sections/CraftTextSection";
import CraftImageSection from "@/components/studio/sections/CraftImageSection";
import CraftImageTextSection from "@/components/studio/sections/CraftImageTextSection";
import CraftReviewsSection from "@/components/studio/sections/CraftReviewsSection";
import CraftPickupSection from "@/components/studio/sections/CraftPickupSection";
import CraftSignupSection from "@/components/studio/sections/CraftSignupSection";
import CraftFarmStandSection from "@/components/studio/sections/CraftFarmStandSection";
import CraftProductDetailSection from "@/components/studio/sections/CraftProductDetailSection";
import CraftMenuDetailSection from "@/components/studio/sections/CraftMenuDetailSection";

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
        <Element is={CraftProductDetailSection} showReviews={false} showBackLink />
      );
    case "CraftMenuDetailSection":
      return <Element is={CraftMenuDetailSection} />;
    case "CraftProductGridSection":
      return (
        <Element
          is={CraftProductGridSection}
          source="all"
          categoryId=""
          productIds={[]}
          limit={8}
          layout="grid"
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
