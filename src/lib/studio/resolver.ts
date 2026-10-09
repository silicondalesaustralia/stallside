import StudioPageRoot from "@/components/studio/sections/StudioPageRoot";
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

import type { StudioSectionType } from "./types";

export const studioResolver = {
  StudioPageRoot,
  CraftPageRoot: StudioPageRoot,
  CraftHeroSection,
  CraftProductGridSection,
  CraftCategoriesSection,
  CraftNextDropSection,
  CraftTextSection,
  CraftImageSection,
  CraftImageTextSection,
  CraftAboutSection,
  CraftReviewsSection,
  CraftPickupSection,
  CraftSignupSection,
  CraftFarmStandSection,
  CraftProductDetailSection,
  CraftMenuDetailSection,
} satisfies Record<StudioSectionType | "StudioPageRoot" | "CraftPageRoot", unknown>;

export type StudioResolver = typeof studioResolver;
