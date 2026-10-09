import type { DemoKit } from "./types";
import { MILL_AND_CRUMB_COPY } from "./mill-and-crumb-copy";

const BASE = "/demo/kits/mill-and-crumb";

export const MILL_AND_CRUMB_KIT: DemoKit = {
  id: "mill-and-crumb",
  placeholderName: "Mill & Crumb",
  vertical: "BAKERY_PREORDER",
  backdropHex: "#E9E6E1",
  business: { locality: "Port Adelaide", contactEmail: "bake@example.com" },
  copy: MILL_AND_CRUMB_COPY,
  categories: [
    { id: "breads", name: "Breads", tilePackshotPath: `${BASE}/packshot-sourdough.png` },
    { id: "pastries", name: "Pastries", tilePackshotPath: `${BASE}/packshot-croissant.png` },
    { id: "cakes", name: "Cakes", tilePackshotPath: `${BASE}/packshot-olive-cake.png` },
    { id: "boxes", name: "Boxes & pantry", tilePackshotPath: `${BASE}/packshot-pastry-box.png` },
  ],
  products: [
    { id: "sourdough", name: "Country sourdough", categoryId: "breads", priceCents: 1200, packshotPath: `${BASE}/packshot-sourdough.png`, cutoutPath: `${BASE}/cutout-sourdough.png` },
    { id: "rye", name: "Seeded rye", categoryId: "breads", priceCents: 1400, badge: "NEW", packshotPath: `${BASE}/packshot-rye.png` },
    { id: "baguette", name: "Baguette", categoryId: "breads", priceCents: 600, packshotPath: `${BASE}/packshot-baguette.png` },
    { id: "croissant", name: "Butter croissant", categoryId: "pastries", priceCents: 550, packshotPath: `${BASE}/packshot-croissant.png`, cutoutPath: `${BASE}/cutout-croissant.png` },
    { id: "pain-choco", name: "Pain au chocolat", categoryId: "pastries", priceCents: 650, soldOut: true, packshotPath: `${BASE}/packshot-pain-choco.png` },
    { id: "cinnamon", name: "Cinnamon scroll", categoryId: "pastries", priceCents: 700, badge: "SEASONAL", packshotPath: `${BASE}/packshot-cinnamon.png` },
    { id: "olive-cake", name: "Olive oil cake", categoryId: "cakes", priceCents: 3200, packshotPath: `${BASE}/packshot-olive-cake.png`, cutoutPath: `${BASE}/cutout-olive-cake.png` },
    { id: "lemon-tart", name: "Lemon tart", categoryId: "cakes", priceCents: 2800, packshotPath: `${BASE}/packshot-lemon-tart.png` },
    { id: "brownie", name: "Brownie slab", categoryId: "cakes", priceCents: 2400, packshotPath: `${BASE}/packshot-brownie.png` },
    { id: "pastry-box", name: "Weekend pastry box with mixed viennoiserie (preorder)", categoryId: "boxes", priceCents: 3600, badge: "NEW", packshotPath: `${BASE}/packshot-pastry-box.png` },
    { id: "bread-sub", name: "Bread subscription", categoryId: "boxes", priceCents: 4800, variants: ["Weekly", "Fortnightly"], packshotPath: `${BASE}/packshot-bread-sub.png` },
    { id: "butter", name: "Cultured butter", categoryId: "boxes", priceCents: 900, packshotPath: `${BASE}/packshot-butter.png` },
  ],
  images: {
    heroWide: `${BASE}/hero-wide.png`,
    heroPortrait: `${BASE}/hero-portrait.png`,
    place: `${BASE}/place.png`,
    process: `${BASE}/process.png`,
  },
};
