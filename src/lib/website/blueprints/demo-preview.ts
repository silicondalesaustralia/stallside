/** Curated demo imagery for starting-style homepage previews (fictional products). */
export type DemoProduct = {
  name: string;
  price: string;
  imageUrl: string;
};

export type DemoCategory = {
  title: string;
  imageUrl: string;
};

const U = (id: string, w = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

/** Shared product pool — previews pick a slice per blueprint. */
export const DEMO_PRODUCTS: DemoProduct[] = [
  { name: "Day bag", price: "$68", imageUrl: U("photo-1548036328-c9fa89d128fa") },
  { name: "Ceramic pourer", price: "$42", imageUrl: U("photo-1610701596007-11502861dcfa") },
  { name: "Linen throw", price: "$96", imageUrl: U("photo-1584100936595-c0654b55a2e2") },
  { name: "Soy candle", price: "$28", imageUrl: U("photo-1602602670576-9fcb0e0e7b3d") },
  { name: "Herb bundle", price: "$12", imageUrl: U("photo-1466637574441-749b8f19452f") },
  { name: "Sourdough loaf", price: "$9", imageUrl: U("photo-1509440159596-0249088772ff") },
  { name: "Farm eggs", price: "$8", imageUrl: U("photo-1582722873440-1a7c9d4a6b0e") },
  { name: "Honey jar", price: "$14", imageUrl: U("photo-1587049352846-4a222e784d38") },
  { name: "Wool beanie", price: "$36", imageUrl: U("photo-1576871337632-b9aef4c17ab9") },
  { name: "Trail bottle", price: "$32", imageUrl: U("photo-1602143407151-7111542de6e8") },
  { name: "Soap set", price: "$24", imageUrl: U("photo-1600857544200-b2f666a9e2ec") },
  { name: "Leather pouch", price: "$54", imageUrl: U("photo-1590874103328-eac38a683ce7") },
];

export const DEMO_CATEGORIES: DemoCategory[] = [
  { title: "New", imageUrl: U("photo-1441986300917-64674bd600d8", 600) },
  { title: "Bestsellers", imageUrl: U("photo-1556742049-0cfed4f6a45d", 600) },
  { title: "Gifts", imageUrl: U("photo-1513885535751-8b9238bd345a", 600) },
  { title: "Outdoor", imageUrl: U("photo-1551632811-561732d1e306", 600) },
];

export const DEMO_HERO_IMAGES = {
  landscape: U("photo-1464226184884-fa280b87c399", 1400),
  studio: U("photo-1441984904996-e0b241908096", 1400),
  food: U("photo-1495521821757-a1efb6729352", 1400),
  fashion: U("photo-1483985988355-763728e1935b", 1400),
  craft: U("photo-1452860606245-08befc0ff44b", 1400),
  bold: U("photo-1523381210434-271e8be1f52b", 1400),
};

export function productsForBlueprint(indexOffset: number, count: number): DemoProduct[] {
  const out: DemoProduct[] = [];
  for (let i = 0; i < count; i++) {
    out.push(DEMO_PRODUCTS[(indexOffset + i) % DEMO_PRODUCTS.length]!);
  }
  return out;
}
