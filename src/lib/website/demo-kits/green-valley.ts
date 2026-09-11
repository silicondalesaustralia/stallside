import type { DemoKit } from "./types";
import { GREEN_VALLEY_COPY } from "./green-valley-copy";

const BASE = "/demo/kits/green-valley";

export const GREEN_VALLEY_KIT: DemoKit = {
  id: "green-valley",
  placeholderName: "Green Valley",
  vertical: "FARM_LOCAL",
  backdropHex: "#EFE7DA",
  business: { locality: "Adelaide Hills", contactEmail: "hello@example.com" },
  copy: GREEN_VALLEY_COPY,
  categories: [
    { id: "produce", name: "Produce", tilePackshotPath: `${BASE}/packshot-tomatoes.svg` },
    { id: "fruit", name: "Fruit", tilePackshotPath: `${BASE}/packshot-apples.svg` },
    { id: "eggs-bakery", name: "Eggs & bakery", tilePackshotPath: `${BASE}/packshot-eggs.svg` },
    { id: "pantry", name: "Pantry & boxes", tilePackshotPath: `${BASE}/packshot-honey.svg` },
  ],
  products: [
    { id: "tomatoes", name: "Heirloom tomatoes, mixed colours 500g", categoryId: "produce", priceCents: 650, badge: "SEASONAL", packshotPath: `${BASE}/packshot-tomatoes.svg`, cutoutPath: `${BASE}/cutout-tomatoes.svg` },
    { id: "carrots", name: "Baby carrots bunch", categoryId: "produce", priceCents: 450, packshotPath: `${BASE}/packshot-carrots.svg` },
    { id: "salad", name: "Salad leaves 200g", categoryId: "produce", priceCents: 550, badge: "NEW", packshotPath: `${BASE}/packshot-salad.svg` },
    { id: "apples", name: "Apples 1kg", categoryId: "fruit", priceCents: 700, packshotPath: `${BASE}/packshot-apples.svg` },
    { id: "strawberries", name: "Strawberries punnet", categoryId: "fruit", priceCents: 600, soldOut: true, packshotPath: `${BASE}/packshot-strawberries.svg` },
    { id: "lemons", name: "Lemons 500g", categoryId: "fruit", priceCents: 400, packshotPath: `${BASE}/packshot-lemons.svg` },
    { id: "eggs", name: "Farm eggs dozen", categoryId: "eggs-bakery", priceCents: 800, packshotPath: `${BASE}/packshot-eggs.svg`, cutoutPath: `${BASE}/cutout-eggs.svg` },
    { id: "sourdough", name: "Sourdough loaf", categoryId: "eggs-bakery", priceCents: 900, badge: "NEW", packshotPath: `${BASE}/packshot-sourdough.svg`, cutoutPath: `${BASE}/cutout-sourdough.svg` },
    { id: "scones", name: "Scones 6-pack", categoryId: "eggs-bakery", priceCents: 1200, packshotPath: `${BASE}/packshot-scones.svg` },
    { id: "honey", name: "Honey 500g", categoryId: "pantry", priceCents: 1400, packshotPath: `${BASE}/packshot-honey.svg` },
    { id: "jam", name: "Strawberry jam", categoryId: "pantry", priceCents: 1100, packshotPath: `${BASE}/packshot-jam.svg` },
    { id: "veg-box", name: "Weekly veg box (subscription)", categoryId: "pantry", priceCents: 2800, variants: ["Small", "Standard", "Family"], packshotPath: `${BASE}/packshot-veg-box.svg` },
  ],
  images: {
    heroWide: `${BASE}/hero-wide.svg`,
    heroPortrait: `${BASE}/hero-portrait.svg`,
    place: `${BASE}/place.svg`,
    process: `${BASE}/process.svg`,
  },
};
