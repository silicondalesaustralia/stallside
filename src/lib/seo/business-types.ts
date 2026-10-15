/** Plain-English business types mapped to schema.org types. `local` types get address, hours and map. */
export const BUSINESS_TYPES = {
  "farm-stand": { label: "Farm stand / farm shop", schemaType: "Store", local: true },
  "market-stall": { label: "Market stall", schemaType: "Store", local: true },
  bakery: { label: "Bakery", schemaType: "Bakery", local: true },
  cafe: { label: "Café / coffee shop", schemaType: "CafeOrCoffeeShop", local: true },
  restaurant: { label: "Restaurant", schemaType: "Restaurant", local: true },
  "food-maker": { label: "Food maker / caterer", schemaType: "FoodEstablishment", local: true },
  grocery: { label: "Grocer / produce store", schemaType: "GroceryStore", local: true },
  florist: { label: "Florist / flower farm", schemaType: "Florist", local: true },
  winery: { label: "Winery", schemaType: "Winery", local: true },
  brewery: { label: "Brewery", schemaType: "Brewery", local: true },
  distillery: { label: "Distillery", schemaType: "Distillery", local: true },
  store: { label: "Other shop", schemaType: "Store", local: true },
  local: { label: "Other local business", schemaType: "LocalBusiness", local: true },
  online: { label: "Online-only shop", schemaType: "OnlineStore", local: false },
} as const;

export type BusinessTypeId = keyof typeof BUSINESS_TYPES;

export const BUSINESS_TYPE_IDS = Object.keys(BUSINESS_TYPES) as BusinessTypeId[];

export function defaultBusinessType(businessMode: string): BusinessTypeId {
  return businessMode === "FOOD_BUSINESS" ? "food-maker" : "farm-stand";
}
