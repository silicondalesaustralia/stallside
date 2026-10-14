import StudioPageRoot from "@/components/studio/sections/StudioPageRoot";
import CraftHeroSection from "@/components/craft/sections/CraftHeroSection";
import CraftProductGridSection from "@/components/craft/sections/CraftProductGridSection";
import CraftNextDropSection from "@/components/craft/sections/CraftNextDropSection";
import CraftAboutSection from "@/components/craft/sections/CraftAboutSection";
import CraftCategoriesSection from "@/components/studio/sections/CraftCategoriesSection";
import CraftTextSection from "@/components/studio/sections/CraftTextSection";
import CraftFaqSection from "@/components/studio/sections/CraftFaqSection";
import CraftImageSection from "@/components/studio/sections/CraftImageSection";
import CraftImageTextSection from "@/components/studio/sections/CraftImageTextSection";

import CraftReviewsSection from "@/components/studio/sections/CraftReviewsSection";
import CraftPickupSection from "@/components/studio/sections/CraftPickupSection";
import CraftSignupSection from "@/components/studio/sections/CraftSignupSection";
import CraftFarmStandSection from "@/components/studio/sections/CraftFarmStandSection";
import CraftPaymentsSection from "@/components/studio/sections/CraftPaymentsSection";
import CraftProductDetailSection from "@/components/studio/sections/CraftProductDetailSection";
import CraftMenuDetailSection from "@/components/studio/sections/CraftMenuDetailSection";
import CraftCartSection from "@/components/studio/sections/CraftCartSection";
import CraftOrderConfirmationSection from "@/components/studio/sections/CraftOrderConfirmationSection";

import type { StudioSectionType } from "./types";

export const studioResolver = {
  StudioPageRoot,
  CraftPageRoot: StudioPageRoot,
  CraftHeroSection,
  CraftProductGridSection,
  CraftCategoriesSection,
  CraftNextDropSection,
  CraftTextSection,
  CraftFaqSection,
  CraftImageSection,
  CraftImageTextSection,
  CraftAboutSection,
  CraftReviewsSection,
  CraftPickupSection,
  CraftSignupSection,
  CraftFarmStandSection,
  CraftPaymentsSection,
  CraftProductDetailSection,
  CraftMenuDetailSection,
  CraftCartSection,
  CraftOrderConfirmationSection,
} satisfies Record<StudioSectionType | "StudioPageRoot" | "CraftPageRoot", unknown>;

export type StudioResolver = typeof studioResolver;
