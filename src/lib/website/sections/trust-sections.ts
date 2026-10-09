import { z } from "zod";
import { ALL_PAGE_KINDS, count, heading, label, shortText } from "./fields";
import type { SectionDefinition } from "./types";
import { DEFAULT_ONLY, PICKUP_VARIANTS, REVIEWS_VARIANTS } from "./variants";

const CONTENT_PAGES = ALL_PAGE_KINDS;

export const reviews: SectionDefinition = {
  type: "reviews",
  version: 1,
  craftName: "CraftReviewsSection",
  label: "Reviews",
  variantProp: "preset",
  variants: REVIEWS_VARIANTS,
  defaultVariant: "cards",
  content: z.object({ heading: heading.optional() }),
  settings: z.object({ maxItems: count(1, 12).optional() }),
  pageKinds: CONTENT_PAGES,
  singleton: true,
  required: false,
  emptyState: "omit",
};

export const pickup: SectionDefinition = {
  type: "pickup",
  version: 1,
  craftName: "CraftPickupSection",
  label: "Pickup & delivery",
  variantProp: "preset",
  variants: PICKUP_VARIANTS,
  defaultVariant: "cards",
  content: z.object({ heading: heading.optional() }),
  settings: z.object({}),
  pageKinds: CONTENT_PAGES,
  singleton: true,
  required: false,
  emptyState: "omit",
};

export const signup: SectionDefinition = {
  type: "signup",
  version: 1,
  craftName: "CraftSignupSection",
  label: "Subscriber signup",
  variants: DEFAULT_ONLY,
  defaultVariant: "default",
  content: z.object({
    heading: heading.optional(),
    body: shortText.optional(),
    buttonLabel: label.optional(),
  }),
  settings: z.object({}),
  pageKinds: CONTENT_PAGES,
  singleton: true,
  required: false,
  emptyState: "render",
};

export const farmStand: SectionDefinition = {
  type: "farmStand",
  version: 1,
  craftName: "CraftFarmStandSection",
  label: "Farm stand",
  variants: DEFAULT_ONLY,
  defaultVariant: "default",
  content: z.object({ heading: heading.optional() }),
  settings: z.object({
    showHours: z.boolean().optional(),
    showLocation: z.boolean().optional(),
    showDirections: z.boolean().optional(),
  }),
  pageKinds: CONTENT_PAGES,
  businessModes: ["FARM_STAND", "BOTH"],
  singleton: true,
  required: false,
  emptyState: "render",
};
