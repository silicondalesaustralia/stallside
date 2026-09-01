/** Onboarding presets — not separate products or account types. */

export const BUSINESS_MODES = [
  "FARM_STAND",
  "FOOD_BUSINESS",
  "BOTH",
] as const;

export type BusinessMode = (typeof BUSINESS_MODES)[number];

export function isBusinessMode(value: string | null | undefined): value is BusinessMode {
  return (
    value != null &&
    (BUSINESS_MODES as readonly string[]).includes(value)
  );
}

export function normalizeBusinessMode(
  value: string | null | undefined,
): BusinessMode {
  return isBusinessMode(value) ? value : "BOTH";
}

/** Public label for Stand records — avoid “Farm Stand” for food-only sellers. */
export function primaryLocationLabel(mode: BusinessMode): string {
  if (mode === "FOOD_BUSINESS") return "Shop";
  if (mode === "BOTH") return "Locations";
  return "Farm Stands";
}

export const BUSINESS_MODE_OPTIONS: readonly {
  id: BusinessMode;
  title: string;
  description: string;
  examples: string;
}[] = [
  {
    id: "FARM_STAND",
    title: "Farm Stand",
    description:
      "Sell from an unattended or self-service stand with QR checkout, stock tracking and instant sale alerts.",
    examples: "Eggs, produce, flowers, baked goods, firewood and honesty stalls.",
  },
  {
    id: "FOOD_BUSINESS",
    title: "Food & Produce Business",
    description:
      "Create a complete storefront for products, pre-orders, pickup, delivery and repeat customers.",
    examples: "Home bakery, farm produce, food boxes, preserves, honey and local food.",
  },
  {
    id: "BOTH",
    title: "Both",
    description:
      "Run your online food or produce business and your farm-gate stand from the same account.",
    examples: "Gate sales plus pickup orders from the same catalogue.",
  },
] as const;

export const SELL_CATEGORIES = [
  { id: "eggs", label: "Eggs" },
  { id: "produce", label: "Fresh produce" },
  { id: "baked", label: "Baked goods" },
  { id: "cakes", label: "Cakes / sweets" },
  { id: "bread", label: "Bread" },
  { id: "honey", label: "Honey" },
  { id: "preserves", label: "Preserves / pantry" },
  { id: "flowers", label: "Flowers" },
  { id: "meat_boxes", label: "Meat / farm boxes" },
  { id: "prepared", label: "Prepared food" },
  { id: "firewood", label: "Firewood" },
  { id: "other", label: "Other" },
] as const;

export type SellCategoryId = (typeof SELL_CATEGORIES)[number]["id"];

export const FULFILMENT_INTENTS = [
  { id: "farm_stand", label: "Farm stand / self-service" },
  { id: "pickup", label: "Pickup" },
  { id: "delivery", label: "Local delivery" },
  { id: "preorders", label: "Pre-orders" },
  { id: "subscriptions", label: "Subscriptions / recurring boxes" },
] as const;

export type FulfilmentIntentId = (typeof FULFILMENT_INTENTS)[number]["id"];

export function defaultFulfilmentIntents(
  mode: BusinessMode,
): FulfilmentIntentId[] {
  if (mode === "FARM_STAND") return ["farm_stand"];
  if (mode === "FOOD_BUSINESS") return ["pickup", "preorders"];
  return ["farm_stand", "pickup", "preorders"];
}

export const AU_STATES = [
  { id: "SA", label: "South Australia" },
  { id: "VIC", label: "Victoria" },
  { id: "NSW", label: "New South Wales" },
  { id: "QLD", label: "Queensland" },
  { id: "WA", label: "Western Australia" },
  { id: "TAS", label: "Tasmania" },
  { id: "NT", label: "Northern Territory" },
  { id: "ACT", label: "Australian Capital Territory" },
] as const;

/** Gate only — progressive setup lives on Getting Started after dashboard. */
export const ONBOARDING_STEPS = ["mode", "profile"] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export function isOnboardingStep(
  value: string | null | undefined,
): value is OnboardingStep {
  return (
    value != null &&
    (ONBOARDING_STEPS as readonly string[]).includes(value)
  );
}
