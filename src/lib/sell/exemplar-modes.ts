import type { MarketSeed, SellMarket } from "./types";

type Mode = SellMarket["sellingModes"][number];

export function exemplarSellingModes(
  seed: MarketSeed,
): SellMarket["sellingModes"] | null {
  const ex = seed.exampleProduct.toLowerCase();
  const bySlug: Record<string, Mode[]> = {
    candles: [
      {
        featureId: "pre-orders",
        example: `Open a pre-order for ${ex} before the next scent release.`,
      },
      {
        featureId: "subscriptions",
        example:
          "Offer a refill or seasonal candle drop where repeat buying fits your process.",
      },
      {
        featureId: "bundles",
        example:
          "Bundle two jar sizes or a candle with wax melts for a gift set.",
      },
      {
        featureId: "qr-checkout",
        example: `Take market stall orders for ${ex} with QR checkout.`,
      },
    ],
    cookies: [
      {
        featureId: "pre-orders",
        example: "Open a weekend bag pre-order with a clear flavour cut-off.",
      },
      {
        featureId: "bundles",
        example: "Bundle two gift bags or mix flavours in one order.",
      },
      {
        featureId: "qr-checkout",
        example: "Take farmers-market bag orders with QR checkout.",
      },
    ],
    crochet: [
      {
        featureId: "stock-sales",
        example: "List finished pieces with quantity one when capacity is tight.",
      },
      {
        featureId: "pre-orders",
        example: "Open a made-to-order window when you have hours available.",
      },
      {
        featureId: "qr-checkout",
        example: "Sell finished accessories at markets with QR checkout.",
      },
    ],
    pottery: [
      {
        featureId: "collections",
        example: "Launch a kiln-unload collection with one-of-one pieces.",
      },
      {
        featureId: "stock-sales",
        example: "Set stock to one so a piece sells out when purchased.",
      },
      {
        featureId: "qr-checkout",
        example: "Sell studio seconds or market pieces with QR checkout.",
      },
    ],
    "3d-printed-products": [
      {
        featureId: "stock-sales",
        example: "List finished planters with size variants and quantities.",
      },
      {
        featureId: "pre-orders",
        example: "Open a pre-order while a print batch runs.",
      },
      {
        featureId: "qr-checkout",
        example: "Sell printed goods at maker markets with QR checkout.",
      },
    ],
    "wooden-signs": [
      {
        featureId: "pre-orders",
        example: "Take personalised text orders with a stated lead time.",
      },
      {
        featureId: "stock-sales",
        example: "List ready blank styles customers can personalise.",
      },
      {
        featureId: "qr-checkout",
        example: "Capture workshop or market orders with QR checkout.",
      },
    ],
  };
  return bySlug[seed.slug] ?? null;
}

export function exemplarOperationsBody(seed: MarketSeed): string | null {
  const bodies: Record<string, string> = {
    candles:
      "Create jar candles with scent and size variants, track available quantities, take payment and fulfil orders — without mixing stock counts and order status in one view.",
    cookies:
      "List gift-bag flavours, open an order window for the next bake, take payment and mark bags ready for collection or delivery.",
    crochet:
      "List finished pieces or open made-to-order capacity, track what you can take on, then fulfil when each piece is ready.",
    pottery:
      "List one-off studio pieces with quantity one, take payment, and fulfil with protective packing or local collection.",
    "3d-printed-products":
      "Create size variants, track finished planters separately from in-progress prints, take payment and fulfil completed pieces.",
    "wooden-signs":
      "Offer supported text and size options, capture order details, take payment and fulfil within your stated lead time — without inventing a proof-approval portal.",
  };
  return bodies[seed.slug] ?? null;
}
