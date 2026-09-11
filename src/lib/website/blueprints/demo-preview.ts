/** @deprecated Unsplash pools removed in Phase 8D.1 — use demo-kits. */
import {
  getDemoKit,
  type DemoKit,
  type DemoKitProduct,
} from "@/lib/website/demo-kits";
import { formatKitPrice } from "@/lib/website/demo-kits";

export type DemoProduct = {
  name: string;
  price: string;
  imageUrl: string;
};

export type DemoCategory = {
  title: string;
  imageUrl: string;
};

const kit = getDemoKit("green-valley");

function toProduct(p: DemoKitProduct): DemoProduct {
  return {
    name: p.name,
    price: formatKitPrice(p.priceCents),
    imageUrl: p.packshotPath,
  };
}

/** @deprecated Prefer getDemoKit().products */
export const DEMO_PRODUCTS: DemoProduct[] = kit.products.map(toProduct);

/** @deprecated Prefer getDemoKit().categories */
export const DEMO_CATEGORIES: DemoCategory[] = kit.categories.map((c) => ({
  title: c.name,
  imageUrl: c.tilePackshotPath,
}));

/** @deprecated Prefer getDemoKit().images */
export const DEMO_HERO_IMAGES = {
  landscape: kit.images.heroWide,
  studio: kit.images.place,
  food: kit.images.heroWide,
  fashion: kit.images.heroPortrait,
  craft: kit.images.process,
  bold: kit.images.heroPortrait,
};

export function productsForBlueprint(indexOffset: number, count: number): DemoProduct[] {
  const out: DemoProduct[] = [];
  for (let i = 0; i < count; i++) {
    out.push(DEMO_PRODUCTS[(indexOffset + i) % DEMO_PRODUCTS.length]!);
  }
  return out;
}

export type { DemoKit };
