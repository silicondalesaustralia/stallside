/** Storefront sample product chips for §15 prototype markets. */

export const EXEMPLAR_SAMPLES: Record<string, string[]> = {
  candles: ["Cedar & fig · 8 oz", "Citrus grove · 4 oz", "Smoke & cedar · 12 oz"],
  cookies: ["Brown butter · 6-pack", "Citrus shortbread · 6-pack", "Double choc · 6-pack"],
  crochet: ["Market bag", "Beanie · adult", "Baby booties"],
  pottery: ["Speckled mug", "Bud vase", "Serving bowl"],
  "3d-printed-products": ["Planter · small", "Planter · medium", "Desk tray"],
  "wooden-signs": ["Workshop sign", "Welcome sign", "Kids’ room name"],
};

export const MIGRATE_HEADING: Record<string, string> = {
  candles: "Starting fresh or moving an existing candle shop?",
  cookies: "Starting fresh or moving an existing cookie business?",
  crochet: "Starting fresh or moving an existing crochet shop?",
  pottery: "Starting fresh or moving an existing pottery shop?",
  "3d-printed-products": "Starting fresh or moving an existing 3D-print shop?",
  "wooden-signs": "Starting fresh or moving an existing sign shop?",
};

export function calcCtaLabel(slug: string, saleUnit: string): string {
  const labels: Record<string, string> = {
    candles: "Try the candle cost calculator",
    cookies: "Try the cookie bag cost calculator",
    crochet: "Try the crochet cost calculator",
    pottery: "Try the pottery cost calculator",
    "3d-printed-products": "Try the 3D-print cost calculator",
    "wooden-signs": "Try the sign cost calculator",
  };
  return labels[slug] ?? `Try the ${saleUnit} cost calculator`;
}
