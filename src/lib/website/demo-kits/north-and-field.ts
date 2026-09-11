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
    { id: "bags", name: "Bags", tilePackshotPath: `${BASE}/packshot-day-pack.svg` },
    { id: "drinkware", name: "Drinkware", tilePackshotPath: `${BASE}/packshot-enamel-mug.svg` },
    { id: "blankets", name: "Blankets", tilePackshotPath: `${BASE}/packshot-wool-blanket.svg` },
    { id: "apparel", name: "Apparel", tilePackshotPath: `${BASE}/packshot-cap.svg` },
  ],
  products: [
    { id: "day-pack", name: "Canvas day pack", categoryId: "bags", priceCents: 8900, badge: "NEW", packshotPath: `${BASE}/packshot-day-pack.svg`, cutoutPath: `${BASE}/cutout-day-pack.svg` },
    { id: "tote", name: "Waxed tote", categoryId: "bags", priceCents: 6800, packshotPath: `${BASE}/packshot-tote.svg` },
    { id: "dry-bag", name: "Roll-top dry bag", categoryId: "bags", priceCents: 4200, packshotPath: `${BASE}/packshot-dry-bag.svg` },
    { id: "enamel-mug", name: "Enamel mug", categoryId: "drinkware", priceCents: 2400, packshotPath: `${BASE}/packshot-enamel-mug.svg`, cutoutPath: `${BASE}/cutout-enamel-mug.svg` },
    { id: "bottle", name: "Insulated bottle", categoryId: "drinkware", priceCents: 4800, packshotPath: `${BASE}/packshot-bottle.svg` },
    { id: "camp-cups", name: "Camp cup set", categoryId: "drinkware", priceCents: 3600, soldOut: true, packshotPath: `${BASE}/packshot-camp-cups.svg` },
    { id: "wool-blanket", name: "Wool camp blanket", categoryId: "blankets", priceCents: 12800, packshotPath: `${BASE}/packshot-wool-blanket.svg`, cutoutPath: `${BASE}/cutout-wool-blanket.svg` },
    { id: "picnic", name: "Picnic rug", categoryId: "blankets", priceCents: 7900, badge: "SEASONAL", packshotPath: `${BASE}/packshot-picnic.svg` },
    { id: "throw", name: "Knitted throw", categoryId: "blankets", priceCents: 9800, packshotPath: `${BASE}/packshot-throw.svg` },
    { id: "cap", name: "Cotton cap", categoryId: "apparel", priceCents: 3200, packshotPath: `${BASE}/packshot-cap.svg` },
    { id: "beanie", name: "Rib beanie", categoryId: "apparel", priceCents: 2800, badge: "NEW", packshotPath: `${BASE}/packshot-beanie.svg` },
    { id: "flannel", name: "Flannel overshirt with reinforced elbows", categoryId: "apparel", priceCents: 11800, variants: ["S", "M", "L", "XL"], packshotPath: `${BASE}/packshot-flannel.svg` },
  ],
  images: {
    heroWide: `${BASE}/hero-wide.svg`,
    heroPortrait: `${BASE}/hero-portrait.svg`,
    place: `${BASE}/place.svg`,
    process: `${BASE}/process.svg`,
  },
};
