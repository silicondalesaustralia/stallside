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
    fontPairId: "orchard-serif",
    designSystem: "farmhouse",
  },
  {
    id: "quiet-coast",
    label: "Quiet coast",
    tagline: "Calm blues and editorial type",
    paletteId: "coast-ink",
    fontPairId: "coast-news",
    designSystem: "artisan",
  },
  {
    id: "kiln-craft",
    label: "Kiln craft",
    tagline: "Handcrafted warmth for makers",
    paletteId: "kiln-umber",
    fontPairId: "kiln-literata",
    designSystem: "artisan",
  },
  {
    id: "berry-table",
    label: "Berry table",
    tagline: "Rich food-led colour with soft contrast",
    paletteId: "berry-row",
    fontPairId: "orchard-serif",
    designSystem: "farmhouse",
  },
  {
    id: "meadow-day",
    label: "Meadow day",
    tagline: "Light sage and approachable type",
    paletteId: "meadow-sage",
    fontPairId: "market-default",
    designSystem: "market",
  },
  {
    id: "night-stall",
    label: "Night stall",
    tagline: "Bold contrast for energetic brands",
    paletteId: "night-market",
    fontPairId: "bold-syne",
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

/** Pick 3 looks from the catalog based on style preference / mode. */
export function proposeBrandLooks(input: {
  stylePreference?: string;
  businessMode?: string;
}): BrandLookCombo[] {
  const style = (input.stylePreference ?? "").toLowerCase();
  const scored = BRAND_LOOK_COMBOS.map((look) => {
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
    return { look, score };
  });
  scored.sort((a, b) => b.score - a.score || a.look.id.localeCompare(b.look.id));
  const top = scored.slice(0, 3).map((s) => s.look);
  if (top.length >= 3) return top;
  return BRAND_LOOK_COMBOS.slice(0, 3);
}
