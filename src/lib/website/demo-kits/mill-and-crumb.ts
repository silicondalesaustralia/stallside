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
    { id: "breads", name: "Breads", tilePackshotPath: `${BASE}/packshot-sourdough.svg` },
    { id: "pastries", name: "Pastries", tilePackshotPath: `${BASE}/packshot-croissant.svg` },
    { id: "cakes", name: "Cakes", tilePackshotPath: `${BASE}/packshot-olive-cake.svg` },
    { id: "boxes", name: "Boxes & pantry", tilePackshotPath: `${BASE}/packshot-pastry-box.svg` },
  ],
  products: [
    { id: "sourdough", name: "Country sourdough", categoryId: "breads", priceCents: 1200, packshotPath: `${BASE}/packshot-sourdough.svg`, cutoutPath: `${BASE}/cutout-sourdough.svg` },
    { id: "rye", name: "Seeded rye", categoryId: "breads", priceCents: 1400, badge: "NEW", packshotPath: `${BASE}/packshot-rye.svg` },
    { id: "baguette", name: "Baguette", categoryId: "breads", priceCents: 600, packshotPath: `${BASE}/packshot-baguette.svg` },
    { id: "croissant", name: "Butter croissant", categoryId: "pastries", priceCents: 550, packshotPath: `${BASE}/packshot-croissant.svg`, cutoutPath: `${BASE}/cutout-croissant.svg` },
    { id: "pain-choco", name: "Pain au chocolat", categoryId: "pastries", priceCents: 650, soldOut: true, packshotPath: `${BASE}/packshot-pain-choco.svg` },
    { id: "cinnamon", name: "Cinnamon scroll", categoryId: "pastries", priceCents: 700, badge: "SEASONAL", packshotPath: `${BASE}/packshot-cinnamon.svg` },
    { id: "olive-cake", name: "Olive oil cake", categoryId: "cakes", priceCents: 3200, packshotPath: `${BASE}/packshot-olive-cake.svg`, cutoutPath: `${BASE}/cutout-olive-cake.svg` },
    { id: "lemon-tart", name: "Lemon tart", categoryId: "cakes", priceCents: 2800, packshotPath: `${BASE}/packshot-lemon-tart.svg` },
    { id: "brownie", name: "Brownie slab", categoryId: "cakes", priceCents: 2400, packshotPath: `${BASE}/packshot-brownie.svg` },
    { id: "pastry-box", name: "Weekend pastry box with mixed viennoiserie (preorder)", categoryId: "boxes", priceCents: 3600, badge: "NEW", packshotPath: `${BASE}/packshot-pastry-box.svg` },
    { id: "bread-sub", name: "Bread subscription", categoryId: "boxes", priceCents: 4800, variants: ["Weekly", "Fortnightly"], packshotPath: `${BASE}/packshot-bread-sub.svg` },
    { id: "butter", name: "Cultured butter", categoryId: "boxes", priceCents: 900, packshotPath: `${BASE}/packshot-butter.svg` },
  ],
  images: {
    heroWide: `${BASE}/hero-wide.svg`,
    heroPortrait: `${BASE}/hero-portrait.svg`,
    place: `${BASE}/place.svg`,
    process: `${BASE}/process.svg`,
  },
};
