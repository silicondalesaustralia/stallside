/** Category card / hero photos under /public/sell/assets */

export const CATEGORY_IMAGES: Record<string, string> = {
  baking: "/sell/assets/cookies.jpg",
  "food-drink": "/sell/assets/food.jpg",
  "beauty-fragrance": "/sell/assets/candles.jpg",
  "jewelry-accessories": "/sell/assets/jewelry.jpg",
  "clothing-textiles": "/sell/assets/textiles.jpg",
  "home-workshop": "/sell/assets/home.jpg",
  "art-custom": "/sell/assets/art.jpg",
  "pets-toys": "/sell/assets/pets.jpg",
};

export const MARKET_HERO_IMAGES: Record<string, string> = {
  candles: "/sell/assets/candles.jpg",
  cookies: "/sell/assets/cookies.jpg",
  crochet: "/sell/assets/textiles.jpg",
  pottery: "/sell/assets/home.jpg",
  "3d-printed-products": "/sell/assets/art.jpg",
  "wooden-signs": "/sell/assets/home.jpg",
};

export function marketHeroImage(slug: string, categoryId: string): string {
  return MARKET_HERO_IMAGES[slug] ?? CATEGORY_IMAGES[categoryId] ?? "/sell/assets/bread.jpg";
}
