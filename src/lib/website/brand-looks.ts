import type { StudioTemplateId } from "@/lib/studio/types";

export type BrandPalette = {
  id: string;
  label: string;
  accent: string;
  secondary: string;
  wash: string;
};

export type BrandFontPair = {
  id: string;
  label: string;
  /** CSS font-family value for display / headlines */
  displayFamily: string;
  /** CSS font-family value for body */
  bodyFamily: string;
  googleFontsHref: string;
};

/** Curated look = palette + fonts + studio template. */
export type BrandLookCombo = {
  id: string;
  label: string;
  tagline: string;
  paletteId: string;
  fontPairId: string;
  designSystem: StudioTemplateId;
  /** When set (e.g. seller brand colours / logo sample), override catalog palette. */
  accentOverride?: string;
  secondaryOverride?: string;
};

export const BRAND_PALETTES: BrandPalette[] = [
  {
    id: "orchard-green",
    label: "Orchard green",
    accent: "#2f5d3a",
    secondary: "#c4a35a",
    wash: "#f3f6f1",
  },
  {
    id: "coast-ink",
    label: "Coast ink",
    accent: "#1f3a4a",
    secondary: "#4f7a8c",
    wash: "#eef3f5",
  },
  {
    id: "kiln-umber",
    label: "Kiln umber",
    accent: "#5c3d2e",
    secondary: "#a67c52",
    wash: "#f7f1ea",
  },
  {
    id: "berry-row",
    label: "Berry row",
    accent: "#6b2d45",
    secondary: "#c4785a",
    wash: "#f8f0f2",
  },
  {
    id: "meadow-sage",
    label: "Meadow sage",
    accent: "#4a6741",
    secondary: "#8b9a6d",
    wash: "#f2f5ef",
  },
  {
    id: "night-market",
    label: "Night market",
    accent: "#1a1a1a",
    secondary: "#d4a017",
    wash: "#f6f4ef",
  },
];

export const BRAND_FONT_PAIRS: BrandFontPair[] = [
  {
    id: "market-default",
    label: "Market",
    displayFamily: "var(--font-display), system-ui, sans-serif",
    bodyFamily: "var(--font-body), system-ui, sans-serif",
    googleFontsHref: "",
  },
  {
    id: "orchard-serif",
    label: "Orchard",
    displayFamily: '"Fraunces", Georgia, serif',
    bodyFamily: '"Source Sans 3", system-ui, sans-serif',
    googleFontsHref:
      "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Source+Sans+3:wght@400;600&display=swap",
  },
  {
    id: "kiln-literata",
    label: "Kiln",
    displayFamily: '"Literata", Georgia, serif',
    bodyFamily: '"Atkinson Hyperlegible", system-ui, sans-serif',
    googleFontsHref:
      "https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Literata:opsz,wght@7..72,500;7..72,700&display=swap",
  },
  {
    id: "coast-news",
    label: "Coast",
    displayFamily: '"Newsreader", Georgia, serif',
    bodyFamily: '"Outfit", system-ui, sans-serif',
    googleFontsHref:
      "https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,500;6..72,700&family=Outfit:wght@400;600&display=swap",
  },
  {
    id: "bold-syne",
    label: "Bold",
    displayFamily: '"Syne", system-ui, sans-serif',
    bodyFamily: '"Outfit", system-ui, sans-serif',
    googleFontsHref:
      "https://fonts.googleapis.com/css2?family=Outfit:wght@400;600&family=Syne:wght@600;700&display=swap",
  },
];

/** Fixed catalog of recommended combinations (AI ranks 3 of these). */
export const BRAND_LOOK_COMBOS: BrandLookCombo[] = [
  {
    id: "warm-orchard",
    label: "Warm orchard",
    tagline: "Friendly farm energy with soft greens",
    paletteId: "orchard-green",
    fontPairId: "market-default",
    designSystem: "farmhouse",
  },
  {
    id: "quiet-coast",
    label: "Quiet coast",
    tagline: "Calm blues with soft contrast",
    paletteId: "coast-ink",
    fontPairId: "market-default",
    designSystem: "artisan",
  },
  {
    id: "kiln-craft",
    label: "Kiln craft",
    tagline: "Handcrafted warmth for makers",
    paletteId: "kiln-umber",
    fontPairId: "market-default",
    designSystem: "artisan",
  },
  {
    id: "berry-table",
    label: "Berry table",
    tagline: "Rich food-led colour with soft contrast",
    paletteId: "berry-row",
    fontPairId: "market-default",
    designSystem: "farmhouse",
  },
  {
    id: "meadow-day",
    label: "Meadow day",
    tagline: "Light sage and approachable greens",
    paletteId: "meadow-sage",
    fontPairId: "market-default",
    designSystem: "market",
  },
  {
    id: "night-stall",
    label: "Night stall",
    tagline: "Bold contrast for energetic brands",
    paletteId: "night-market",
    fontPairId: "market-default",
    designSystem: "market",
  },
];

export function getPalette(id: string | null | undefined): BrandPalette | undefined {
  return BRAND_PALETTES.find((p) => p.id === id);
}

export function getFontPair(id: string | null | undefined): BrandFontPair | undefined {
  return BRAND_FONT_PAIRS.find((f) => f.id === id);
}

export function getLookCombo(id: string | null | undefined): BrandLookCombo | undefined {
  return BRAND_LOOK_COMBOS.find((c) => c.id === id);
}

function hexToHue(hex: string): number | null {
  const m = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m?.[1]) return null;
  const n = m[1];
  const r = parseInt(n.slice(0, 2), 16) / 255;
  const g = parseInt(n.slice(2, 4), 16) / 255;
  const b = parseInt(n.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return 0;
  let h = 0;
  const d = max - min;
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      break;
    case g:
      h = ((b - r) / d + 2) / 6;
      break;
    default:
      h = ((r - g) / d + 4) / 6;
  }
  return h * 360;
}

function hueDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

function colourScore(seed: string | null | undefined, paletteAccent: string): number {
  if (!seed) return 0;
  const seedHue = hexToHue(seed);
  const palHue = hexToHue(paletteAccent);
  if (seedHue == null || palHue == null) return 0;
  const dist = hueDistance(seedHue, palHue);
  if (dist < 25) return 4;
  if (dist < 45) return 2;
  if (dist < 70) return 1;
  return 0;
}

function pickFontForMode(_businessMode?: string): string {
  // Colour recommendations only — site uses the default Vendl type stack for now.
  return "market-default";
}

function pickTemplateForMode(businessMode?: string): StudioTemplateId {
  if (businessMode === "FOOD_BUSINESS") return "artisan";
  if (businessMode === "FARM_STAND") return "farmhouse";
  return "market";
}

/** Pick 3 looks from the catalog, biased by style + seller brand / logo colours. */
export function proposeBrandLooks(input: {
  stylePreference?: string;
  businessMode?: string;
  seedAccent?: string | null;
  seedSecondary?: string | null;
  hasLogo?: boolean;
}): BrandLookCombo[] {
  const style = (input.stylePreference ?? "").toLowerCase();
  const scored = BRAND_LOOK_COMBOS.map((look) => {
    const palette = getPalette(look.paletteId);
    let score = 0;
    if (style.includes("warm") || style.includes("local")) {
      if (look.id === "warm-orchard" || look.id === "berry-table") score += 3;
      if (look.designSystem === "farmhouse") score += 1;
    }
    if (style.includes("premium") || style.includes("handcrafted")) {
      if (look.id === "kiln-craft" || look.id === "quiet-coast") score += 3;
      if (look.designSystem === "artisan") score += 1;
    }
    if (style.includes("clean") || style.includes("modern")) {
      if (look.id === "quiet-coast" || look.id === "meadow-day") score += 3;
    }
    if (style.includes("bold") || style.includes("energetic")) {
      if (look.id === "night-stall" || look.id === "berry-table") score += 3;
      if (look.designSystem === "market") score += 1;
    }
    if (input.businessMode === "FOOD_BUSINESS" && look.designSystem === "artisan") {
      score += 1;
    }
    if (
      (input.businessMode === "FARM_STAND" || input.businessMode === "BOTH") &&
      look.designSystem === "farmhouse"
    ) {
      score += 1;
    }
    if (palette) {
      score += colourScore(input.seedAccent, palette.accent);
      score += colourScore(input.seedSecondary, palette.secondary) * 0.5;
    }
    return { look, score };
  });
  scored.sort((a, b) => b.score - a.score || a.look.id.localeCompare(b.look.id));

  const catalogTop = scored.slice(0, 3).map((s) => s.look);
  const seedAccent = input.seedAccent?.trim();
  const seedSecondary = input.seedSecondary?.trim() || seedAccent;
  if (!seedAccent || !seedSecondary) {
    return catalogTop.length >= 3 ? catalogTop : BRAND_LOOK_COMBOS.slice(0, 3);
  }

  const yourColours: BrandLookCombo = {
    id: "your-colours",
    label: input.hasLogo ? "Your logo colours" : "Your brand colours",
    tagline: input.hasLogo
      ? "Built from the colours you set (and your logo)"
      : "Keeps the primary and secondary you chose in Branding",
    paletteId: "orchard-green",
    fontPairId: pickFontForMode(input.businessMode),
    designSystem: pickTemplateForMode(input.businessMode),
    accentOverride: seedAccent,
    secondaryOverride: seedSecondary,
  };

  const companions = scored
    .map((s) => s.look)
    .filter((l) => l.id !== "your-colours")
    .slice(0, 2);

  return [yourColours, ...companions].slice(0, 3);
}
