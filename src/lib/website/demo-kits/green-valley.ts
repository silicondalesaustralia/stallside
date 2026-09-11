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
    { id: "produce", name: "Produce", tilePackshotPath: `${BASE}/packshot-tomatoes.png` },
    { id: "fruit", name: "Fruit", tilePackshotPath: `${BASE}/packshot-apples.png` },
    { id: "eggs-bakery", name: "Eggs & bakery", tilePackshotPath: `${BASE}/packshot-eggs.png` },
    { id: "pantry", name: "Pantry & boxes", tilePackshotPath: `${BASE}/packshot-honey.png` },
  ],
  products: [
    { id: "tomatoes", name: "Heirloom tomatoes, mixed colours 500g", categoryId: "produce", priceCents: 650, badge: "SEASONAL", packshotPath: `${BASE}/packshot-tomatoes.png`, cutoutPath: `${BASE}/cutout-tomatoes.png` },
    { id: "carrots", name: "Baby carrots bunch", categoryId: "produce", priceCents: 450, packshotPath: `${BASE}/packshot-carrots.png` },
    { id: "salad", name: "Salad leaves 200g", categoryId: "produce", priceCents: 550, badge: "NEW", packshotPath: `${BASE}/packshot-salad.png` },
    { id: "apples", name: "Apples 1kg", categoryId: "fruit", priceCents: 700, packshotPath: `${BASE}/packshot-apples.png` },
    { id: "strawberries", name: "Strawberries punnet", categoryId: "fruit", priceCents: 600, soldOut: true, packshotPath: `${BASE}/packshot-strawberries.png` },
    { id: "lemons", name: "Lemons 500g", categoryId: "fruit", priceCents: 400, packshotPath: `${BASE}/packshot-lemons.png` },
    { id: "eggs", name: "Farm eggs dozen", categoryId: "eggs-bakery", priceCents: 800, packshotPath: `${BASE}/packshot-eggs.png`, cutoutPath: `${BASE}/cutout-eggs.png` },
    { id: "sourdough", name: "Sourdough loaf", categoryId: "eggs-bakery", priceCents: 900, badge: "NEW", packshotPath: `${BASE}/packshot-sourdough.png`, cutoutPath: `${BASE}/cutout-sourdough.png` },
    { id: "scones", name: "Scones 6-pack", categoryId: "eggs-bakery", priceCents: 1200, packshotPath: `${BASE}/packshot-scones.png` },
    { id: "honey", name: "Honey 500g", categoryId: "pantry", priceCents: 1400, packshotPath: `${BASE}/packshot-honey.png` },
    { id: "jam", name: "Strawberry jam", categoryId: "pantry", priceCents: 1100, packshotPath: `${BASE}/packshot-jam.png` },
    { id: "veg-box", name: "Weekly veg box (subscription)", categoryId: "pantry", priceCents: 2800, variants: ["Small", "Standard", "Family"], packshotPath: `${BASE}/packshot-veg-box.png` },
  ],
  images: {
    heroWide: `${BASE}/hero-wide.png`,
    heroPortrait: `${BASE}/hero-portrait.png`,
    place: `${BASE}/place.png`,
    process: `${BASE}/process.png`,
  },
};
