import CraftPageRoot from "@/components/craft/sections/CraftPageRoot";
import CraftHeroSection from "@/components/craft/sections/CraftHeroSection";
import CraftProductGridSection from "@/components/craft/sections/CraftProductGridSection";
import CraftNextDropSection from "@/components/craft/sections/CraftNextDropSection";
import CraftAboutSection from "@/components/craft/sections/CraftAboutSection";

export const craftSpikeResolver = {
  CraftPageRoot,
  CraftHeroSection,
  CraftProductGridSection,
  CraftNextDropSection,
  CraftAboutSection,
};

export type CraftResolver = typeof craftSpikeResolver;
