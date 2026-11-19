import type { MarketSeed, SellMarket } from "./types";
import {
  exemplarOperationsBody,
  exemplarSellingModes,
} from "./exemplar-modes";

export function storefrontBody(seed: MarketSeed): string {
  const bodies: Record<string, string> = {
    candles:
      "Show jar candles with scent and size options. Free includes a shop link; Pro adds a website and custom domain.",
    cookies:
      "Show gift bags with flavour options and pack sizes. Free includes a shop link; Pro adds a website and custom domain.",
    crochet:
      "Show finished crochet pieces with size options. Free includes a shop link; Pro adds a website and custom domain.",
    pottery:
      "Show studio pieces with clear one-of-one availability. Free includes a shop link; Pro adds a website and custom domain.",
    "3d-printed-products":
      "Show printed planters with size options. Free includes a shop link; Pro adds a website and custom domain.",
    "wooden-signs":
      "Show signs with supported text and size fields. Free includes a shop link; Pro adds a website and custom domain.",
  };
  return (
    bodies[seed.slug] ??
    `Show ${seed.exampleProduct.toLowerCase()} with the options you sell. Free includes a shop link; Pro adds a website and custom domain.`
  );
}

export function marketingCopy(seed: MarketSeed): SellMarket["marketing"] {
  const product = seed.exampleProduct;
  const tailored: Record<string, SellMarket["marketing"]> = {
    candles: {
      productName: product,
      socialExample: `Share ${product.toLowerCase()} with a shop link and scent details.`,
      videoExample: `Short pour or packing clip for ${product.toLowerCase()}.`,
      emailExample: `Subject: ${product} is back in stock`,
    },
    cookies: {
      productName: product,
      socialExample: `Post this weekend’s ${product.toLowerCase()} with order cut-off time.`,
      videoExample: `Short clip of packing ${product.toLowerCase()} for collection.`,
      emailExample: `Subject: Cookie bags open for Saturday`,
    },
    crochet: {
      productName: product,
      socialExample: `Show a finished piece with yarn details and shop link.`,
      videoExample: `Short making clip that ends on the finished ${seed.saleUnit}.`,
      emailExample: `Subject: New crochet pieces ready to order`,
    },
    pottery: {
      productName: product,
      socialExample: `Photograph one studio piece with collection details.`,
      videoExample: `Short kiln-unload or glazing clip for the release.`,
      emailExample: `Subject: Studio collection is live`,
    },
    "3d-printed-products": {
      productName: product,
      socialExample: `Show size options for ${product.toLowerCase()} with a shop link.`,
      videoExample: `Short time-lapse of a print finishing, then packing.`,
      emailExample: `Subject: Planters printed and ready`,
    },
    "wooden-signs": {
      productName: product,
      socialExample: `Show a finished personalised sign and how to order text.`,
      videoExample: `Short clip of lettering or finishing a workshop sign.`,
      emailExample: `Subject: Order a personalised workshop sign`,
    },
  };
  return (
    tailored[seed.slug] ?? {
      productName: product,
      socialExample: `Post ${product.toLowerCase()} with a direct shop link.`,
      videoExample: `Short clip of making or packing ${product.toLowerCase()}.`,
      emailExample: `Subject: ${product} is ready to order`,
    }
  );
}

export function sellingModes(seed: MarketSeed): SellMarket["sellingModes"] {
  const tailored = exemplarSellingModes(seed);
  if (tailored) return tailored;
  const ex = seed.exampleProduct.toLowerCase();
  const modes: SellMarket["sellingModes"] = [
    {
      featureId: "pre-orders",
      example: `Open a pre-order for ${ex} before the next release.`,
    },
    {
      featureId: "qr-checkout",
      example: `Take market or stall orders for ${ex} with QR checkout.`,
    },
  ];
  if (seed.variant === "fresh" || seed.variant === "batch") {
    modes.push({
      featureId: "subscriptions",
      example: `Offer a repeat drop or refill where it fits ${seed.label.toLowerCase()}.`,
    });
  } else {
    modes.push({
      featureId: "stock-sales",
      example: `List finished ${seed.saleUnit}s with clear available quantities.`,
    });
  }
  return modes;
}

export function operations(
  seed: MarketSeed,
  product: string,
): SellMarket["operations"] {
  return {
    heading: "Products, stock and orders. Together.",
    body:
      exemplarOperationsBody(seed) ??
      `Create products, track available ${seed.saleUnit}s and fulfil orders for ${product.toLowerCase()} in one place.`,
    steps: [
      {
        title: "List what you make",
        description: `Add ${product.toLowerCase()} with the options you support.`,
        featureId: "products",
      },
      {
        title: "Set availability",
        description:
          "Use stock counts or order windows that match your capacity.",
        featureId: "stock",
      },
      {
        title: "Take and fulfil orders",
        description:
          "Collect payment and mark orders ready for collection or shipping.",
        featureId: "orders",
      },
    ],
  };
}

export function resourceLinks(): SellMarket["resourceLinks"] {
  return [
    {
      href: "/sell",
      label: "Browse all maker businesses",
      reason: "Directory of related markets",
    },
    {
      href: "/#pricing",
      label: "Vendl pricing",
      reason: "Current Free and Pro plans",
    },
  ];
}
