import type { SerializedNodes } from "@craftjs/core";
import type { PuckSpikeMetadata } from "@/lib/puck/types";

export const CRAFT_SPIKE_VERSION = 1 as const;

export type CraftSpikePayload = {
  version: typeof CRAFT_SPIKE_VERSION;
  engine: "craft";
  nodes: SerializedNodes;
};

/** Commerce metadata resolved server-side — not stored in Craft JSON. */
export type CraftSpikeMetadata = PuckSpikeMetadata;

export type CraftSectionType =
  | "CraftHeroSection"
  | "CraftProductGridSection"
  | "CraftNextDropSection"
  | "CraftAboutSection";
