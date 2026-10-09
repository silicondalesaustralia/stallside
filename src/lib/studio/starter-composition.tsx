import { Element } from "@craftjs/core";
import type { ReactNode } from "react";
import type { StudioTemplateId } from "./types";
import {
  defaultHeroPreset,
  defaultProductPreset,
} from "./preset-registry";
import StudioPageRoot from "@/components/studio/sections/StudioPageRoot";
import CraftHeroSection from "@/components/craft/sections/CraftHeroSection";
import CraftProductGridSection from "@/components/craft/sections/CraftProductGridSection";
import CraftNextDropSection from "@/components/craft/sections/CraftNextDropSection";
import CraftAboutSection from "@/components/craft/sections/CraftAboutSection";
import CraftCategoriesSection from "@/components/studio/sections/CraftCategoriesSection";
import CraftImageTextSection from "@/components/studio/sections/CraftImageTextSection";
import CraftReviewsSection from "@/components/studio/sections/CraftReviewsSection";
import CraftPickupSection from "@/components/studio/sections/CraftPickupSection";
import CraftSignupSection from "@/components/studio/sections/CraftSignupSection";
import CraftFarmStandSection from "@/components/studio/sections/CraftFarmStandSection";

export function buildStudioStarterTree(input: {
  templateId: StudioTemplateId;
  headline: string;
  subheadline: string | null;
  about: string | null;
  showNextDrop: boolean;
}) {
  const heroPreset = defaultHeroPreset(input.templateId);
  const productPreset = defaultProductPreset(input.templateId);

  const hero = (
    <CraftHeroSection
      headline={input.headline}
      supportingText={input.subheadline ?? ""}
      layout={heroPreset}
      ctaLabel={input.templateId === "market" ? "Shop now" : "Browse"}
      showCta
    />
  );

  const farmStand = input.templateId === "farmhouse" ? (
    <CraftFarmStandSection heading="Visit the stand" showHours showLocation showDirections />
  ) : null;

  const nextDrop = input.showNextDrop ? (
    <CraftNextDropSection
      maxItems={input.templateId === "market" ? 3 : 1}
      showClosingDate
      showPickupDate
      preset={
        input.templateId === "farmhouse"
          ? "next-collection"
          : input.templateId === "market"
            ? "current-menu"
            : "featured"
      }
      heading={
        input.templateId === "farmhouse"
          ? "Next collection"
          : input.templateId === "market"
            ? "Next drop"
            : "Next bake"
      }
    />
  ) : null;

  const products = (
    <CraftProductGridSection
      source="all"
      categoryId=""
      productIds={[]}
      limit={input.templateId === "market" ? 12 : input.templateId === "farmhouse" ? 8 : 8}
      layout="grid"
      columns={input.templateId === "market" ? 4 : 3}
      preset={productPreset}
      heading={
        input.templateId === "farmhouse"
          ? "Fresh from the farm"
          : input.templateId === "market"
            ? "Shop all"
            : "Fresh from the oven"
      }
      showPrice
      showAvailability
    />
  );

  const story = (
    <CraftImageTextSection
      imageUrl=""
      heading={input.templateId === "farmhouse" ? "Our farm" : "Our story"}
      body={
        input.about ??
        (input.templateId === "farmhouse"
          ? "Share how you grow, what you stand for, and why locals keep coming back."
          : "Share how you bake, what you stand for, and why customers keep coming back.")
      }
      layout={input.templateId === "farmhouse" ? "image-left" : "image-left"}
      ctaLabel=""
    />
  );

  const categories = (
    <CraftCategoriesSection
      source="all"
      categoryIds={[]}
      preset={
        input.templateId === "farmhouse"
          ? "produce-tiles"
          : input.templateId === "market"
            ? "shop-cards"
            : "tiles"
      }
      heading={
        input.templateId === "market" ? "Shop by category" : "Browse categories"
      }
    />
  );

  const reviews = (
    <CraftReviewsSection preset="cards" heading="What customers say" maxItems={4} />
  );

  const pickup = (
    <CraftPickupSection
      preset={input.templateId === "farmhouse" ? "visit-stand" : "cards"}
      heading={input.templateId === "farmhouse" ? "Location & pickup" : "Pickup & delivery"}
    />
  );

  const signup = (
    <CraftSignupSection
      heading={
        input.templateId === "farmhouse" ? "Join the farm list" : "Stay in the loop"
      }
      body={
        input.templateId === "farmhouse"
          ? "Get weekly availability and collection reminders."
          : "Be first to hear about the next bake and seasonal specials."
      }
      buttonLabel="Subscribe"
    />
  );

  const about = (
    <CraftAboutSection
      heading="About us"
      body={input.about ?? "Tell customers who you are and what you make."}
      layout="simple"
    />
  );

  const sections: ReactNode[] = [hero];

  if (input.templateId === "artisan") {
    if (nextDrop) sections.push(nextDrop);
    sections.push(products);
    sections.push(story);
    sections.push(categories);
    sections.push(reviews);
    sections.push(pickup);
    sections.push(signup);
  } else if (input.templateId === "farmhouse") {
    if (farmStand) sections.push(farmStand);
    sections.push(products);
    sections.push(pickup);
    sections.push(categories);
    sections.push(story);
    sections.push(signup);
    sections.push(reviews);
  } else {
    sections.push(categories);
    sections.push(products);
    if (nextDrop) sections.push(nextDrop);
    sections.push(reviews);
    sections.push(pickup);
    sections.push(signup);
  }

  return (
    <Element is={StudioPageRoot} canvas>
      {sections}
    </Element>
  );
}
