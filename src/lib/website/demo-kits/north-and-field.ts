import type { DemoKit } from "./types";
import { NORTH_AND_FIELD_COPY } from "./north-and-field-copy";

const BASE = "/demo/kits/north-and-field";

export const NORTH_AND_FIELD_KIT: DemoKit = {
  id: "north-and-field",
  placeholderName: "North & Field",
  vertical: "GENERAL_PRODUCTS",
  backdropHex: "#DAD7D0",
  business: { locality: "Melbourne", contactEmail: "shop@example.com" },
  copy: NORTH_AND_FIELD_COPY,
  categories: [
    { id: "bags", name: "Bags", tilePackshotPath: `${BASE}/packshot-day-pack.png` },
    { id: "drinkware", name: "Drinkware", tilePackshotPath: `${BASE}/packshot-enamel-mug.png` },
    { id: "blankets", name: "Blankets", tilePackshotPath: `${BASE}/packshot-wool-blanket.png` },
    { id: "apparel", name: "Apparel", tilePackshotPath: `${BASE}/packshot-cap.png` },
  ],
  products: [
    { id: "day-pack", name: "Canvas day pack", categoryId: "bags", priceCents: 8900, badge: "NEW", packshotPath: `${BASE}/packshot-day-pack.png`, cutoutPath: `${BASE}/cutout-day-pack.png` },
    { id: "tote", name: "Waxed tote", categoryId: "bags", priceCents: 6800, packshotPath: `${BASE}/packshot-tote.png` },
    { id: "dry-bag", name: "Roll-top dry bag", categoryId: "bags", priceCents: 4200, packshotPath: `${BASE}/packshot-dry-bag.png` },
    { id: "enamel-mug", name: "Enamel mug", categoryId: "drinkware", priceCents: 2400, packshotPath: `${BASE}/packshot-enamel-mug.png`, cutoutPath: `${BASE}/cutout-enamel-mug.png` },
    { id: "bottle", name: "Insulated bottle", categoryId: "drinkware", priceCents: 4800, packshotPath: `${BASE}/packshot-bottle.png` },
    { id: "camp-cups", name: "Camp cup set", categoryId: "drinkware", priceCents: 3600, soldOut: true, packshotPath: `${BASE}/packshot-camp-cups.png` },
    { id: "wool-blanket", name: "Wool camp blanket", categoryId: "blankets", priceCents: 12800, packshotPath: `${BASE}/packshot-wool-blanket.png`, cutoutPath: `${BASE}/cutout-wool-blanket.png` },
    { id: "picnic", name: "Picnic rug", categoryId: "blankets", priceCents: 7900, badge: "SEASONAL", packshotPath: `${BASE}/packshot-picnic.png` },
    { id: "throw", name: "Knitted throw", categoryId: "blankets", priceCents: 9800, packshotPath: `${BASE}/packshot-throw.png` },
    { id: "cap", name: "Cotton cap", categoryId: "apparel", priceCents: 3200, packshotPath: `${BASE}/packshot-cap.png` },
    { id: "beanie", name: "Rib beanie", categoryId: "apparel", priceCents: 2800, badge: "NEW", packshotPath: `${BASE}/packshot-beanie.png` },
    { id: "flannel", name: "Flannel overshirt with reinforced elbows", categoryId: "apparel", priceCents: 11800, variants: ["S", "M", "L", "XL"], packshotPath: `${BASE}/packshot-flannel.png` },
  ],
  images: {
    heroWide: `${BASE}/hero-wide.png`,
    heroPortrait: `${BASE}/hero-portrait.png`,
    place: `${BASE}/place.png`,
    process: `${BASE}/process.png`,
  },
};
