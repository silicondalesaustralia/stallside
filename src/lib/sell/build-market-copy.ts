import type { MarketSeed, SellVariant } from "./types";

const H1_BY_VARIANT: Record<SellVariant, (label: string) => string> = {
  fresh: (l) =>
    `Sell your ${l.toLowerCase()} online. Take orders for your next batch.`,
  batch: (l) => `Sell your ${l.toLowerCase()}. Know your cost per unit.`,
  labour: (l) =>
    `Sell your ${l.toLowerCase()}. Price the time you put into it.`,
  machine: (l) =>
    `Sell your ${l.toLowerCase()}. Bring materials and making costs together.`,
  unique: (l) => `Give your next ${l.toLowerCase()} collection its own shop.`,
  personalized: (l) =>
    `Sell personalised ${l.toLowerCase()} online. Keep options and costs clear.`,
};

const H1_OVERRIDES: Record<string, string> = {
  candles: "Sell your candles online. Know what each one earns.",
  cookies: "Sell your cookies online. Take orders for your next batch.",
  sourdough: "Give your next bake a place to sell.",
  soap: "Sell your handmade soap. Know your cost per bar.",
  crochet: "Sell your crochet work. Price the time you put into it.",
  pottery: "Give your next pottery collection its own shop.",
  "3d-printed-products":
    "Sell your 3D prints. Bring materials and making costs together.",
  "wooden-signs":
    "Sell personalised wooden signs online. Keep options and costs clear.",
};

const SEO_TITLE: Record<string, string> = {
  candles: "Sell Candles Online — A Website for Candle Makers | Vendl",
  cookies: "Sell Cookies Online — Tools for Bakers | Vendl",
  crochet: "Sell Crochet Online — Tools for Makers | Vendl",
  pottery: "Sell Pottery Online — A Shop for Ceramic Artists | Vendl",
  "3d-printed-products":
    "Sell 3D Prints Online — Tools for Makers | Vendl",
  "wooden-signs":
    "Sell Personalised Signs Online — Tools for Makers | Vendl",
};

const STOREFRONT_H2: Record<string, string> = {
  candles: "Give your candle collection its own shop",
  cookies: "Give your cookie collection its own shop",
  crochet: "Give your crochet collection its own shop",
  pottery: "Give your pottery collection its own shop",
  "3d-printed-products": "Give your 3D-print collection its own shop",
  "wooden-signs": "Give your sign collection its own shop",
};

export type CopySource = Pick<MarketSeed, "slug" | "label" | "saleUnit" | "variant">;

export function heroHeading(seed: Pick<MarketSeed, "slug" | "label" | "variant">): string {
  return H1_OVERRIDES[seed.slug] ?? H1_BY_VARIANT[seed.variant](seed.label);
}

export function heroBody(
  seed: CopySource & Pick<MarketSeed, "exampleProduct">,
): string {
  const bodies: Record<string, string> = {
    candles:
      "Give your candles a place to sell. Manage your products and orders, then use Vendl Pro to bring wax, fragrance, jars, packaging and your time into one cost calculation.",
    cookies:
      "Open orders for your next bake. Manage flavours and gift bags, then use Vendl Pro to cost cookies produced versus bags sold.",
    crochet:
      "Give your crochet work a place to sell. Manage finished pieces and capacity, then use Vendl Pro to include yarn and making time in each price.",
    pottery:
      "Give your next pottery collection its own shop. List one-off pieces, then use Vendl Pro to allocate clay, glaze, firing and studio time.",
    "3d-printed-products":
      "Sell physical 3D prints with clear size options. Use Vendl Pro to separate filament, machine allocation and finishing labour.",
    "wooden-signs":
      "Take personalised sign orders with supported text and size options. Use Vendl Pro to price wood, lettering, setup and packaging.",
  };
  if (bodies[seed.slug]) return bodies[seed.slug]!;
  return `Give your ${seed.label.toLowerCase()} a place to sell. Manage products and orders, then use Vendl Pro to cost ${seed.exampleProduct.toLowerCase()} with materials, labour and packaging.`;
}

export function seoTitle(seed: Pick<MarketSeed, "slug" | "label">): string {
  return (
    SEO_TITLE[seed.slug] ??
    `Sell ${seed.label} Online — Tools for Makers | Vendl`
  );
}

export function seoDescription(
  seed: CopySource | Pick<MarketSeed, "slug" | "label" | "saleUnit">,
): string {
  if (seed.slug === "candles") {
    return "Sell your candles with Vendl. Create a shop, calculate batch costs and manage orders. Start with a free shop link; add a website and costing tools with Pro.";
  }
  return `Sell ${seed.label.toLowerCase()} with Vendl. Create a shop, cost ${seed.saleUnit} batches and manage orders. Free shop link to start; website and costing with Pro.`;
}

export function storefrontHeading(seed: Pick<MarketSeed, "slug" | "label">): string {
  return (
    STOREFRONT_H2[seed.slug] ??
    `Give your ${seed.label.toLowerCase()} collection its own shop`
  );
}

export function calculatorIntro(seed: CopySource): string {
  const unit = seed.saleUnit;
  const intros: Record<string, string> = {
    candles:
      "Add the materials used in your batch, your making time and allocated overheads. Divide by the number of saleable candles, then add packaging per candle.",
    cookies:
      "Cost the dough batch and labour for cookies produced, divide by saleable gift bags (here: 48 cookies ÷ 6 per bag = 8 bags), then add packaging per bag.",
    crochet:
      "Add yarn, overhead and the hours you spend on one piece, then add packaging. Making time is usually the cost easiest to undercount.",
    pottery:
      "Allocate clay, glaze, firing and studio labour to one saleable piece, then add protective packaging.",
    "3d-printed-products":
      "Add filament, machine allocation and active finishing labour for the run, divide by saleable planters, then add packaging. Keep unattended machine time separate from finishing labour.",
    "wooden-signs":
      "Add the wood blank, lettering/finish and setup labour for one sign, then add packaging. Recalculate when size or lettering complexity changes.",
  };
  return (
    intros[seed.slug] ??
    `Add the materials used in your batch, your making time and allocated overheads. Divide by saleable ${unit}s, then add packaging per ${unit}.`
  );
}

export function sellingModesHeading(seed: CopySource): string {
  if (seed.variant === "fresh" || seed.variant === "batch") {
    return "More ways to sell your next batch";
  }
  if (seed.variant === "unique") return "More ways to sell your next collection";
  if (seed.variant === "personalized") return "More ways to take the next order";
  return "More ways to sell";
}

export function marketingHeading(seed: CopySource): string {
  return `One ${seed.saleUnit}. A post, a clip and an email.`;
}
