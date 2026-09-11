export type BrandFontPair = {
  id: string;
  label: string;
  /** Short mood line for pickers */
  description: string;
  /** CSS font-family value for display / headlines */
  displayFamily: string;
  /** CSS font-family value for body */
  bodyFamily: string;
  googleFontsHref: string;
};

export const BRAND_FONT_PAIRS: BrandFontPair[] = [
  {
    id: "market-default",
    label: "Market",
    description: "Vendl default type stack",
    displayFamily: "var(--font-display), system-ui, sans-serif",
    bodyFamily: "var(--font-body), system-ui, sans-serif",
    googleFontsHref: "",
  },
  {
    id: "orchard-serif",
    label: "Orchard",
    description: "Warm display serif with clean sans body",
    displayFamily: '"Fraunces", Georgia, serif',
    bodyFamily: '"Source Sans 3", system-ui, sans-serif',
    googleFontsHref:
      "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Source+Sans+3:wght@400;600&display=swap",
  },
  {
    id: "kiln-literata",
    label: "Kiln",
    description: "Readable literary serif + highly legible sans",
    displayFamily: '"Literata", Georgia, serif',
    bodyFamily: '"Atkinson Hyperlegible", system-ui, sans-serif',
    googleFontsHref:
      "https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Literata:opsz,wght@7..72,500;7..72,700&display=swap",
  },
  {
    id: "coast-news",
    label: "Coast",
    description: "Editorial newsreader with modern sans",
    displayFamily: '"Newsreader", Georgia, serif',
    bodyFamily: '"Outfit", system-ui, sans-serif',
    googleFontsHref:
      "https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,500;6..72,700&family=Outfit:wght@400;600&display=swap",
  },
  {
    id: "bold-syne",
    label: "Bold",
    description: "Punchy geometric headlines",
    displayFamily: '"Syne", system-ui, sans-serif',
    bodyFamily: '"Outfit", system-ui, sans-serif',
    googleFontsHref:
      "https://fonts.googleapis.com/css2?family=Outfit:wght@400;600&family=Syne:wght@600;700&display=swap",
  },
  {
    id: "clean-dm",
    label: "Clean",
    description: "Simple geometric sans throughout",
    displayFamily: '"DM Sans", system-ui, sans-serif',
    bodyFamily: '"DM Sans", system-ui, sans-serif',
    googleFontsHref:
      "https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,600;9..40,700&display=swap",
  },
  {
    id: "editorial-playfair",
    label: "Editorial",
    description: "High-contrast serif for premium storytelling",
    displayFamily: '"Playfair Display", Georgia, serif',
    bodyFamily: '"Lato", system-ui, sans-serif',
    googleFontsHref:
      "https://fonts.googleapis.com/css2?family=Lato:wght@400;700&family=Playfair+Display:wght@500;700&display=swap",
  },
  {
    id: "friendly-nunito",
    label: "Friendly",
    description: "Soft rounded sans — approachable and local",
    displayFamily: '"Nunito", system-ui, sans-serif',
    bodyFamily: '"Nunito Sans", system-ui, sans-serif',
    googleFontsHref:
      "https://fonts.googleapis.com/css2?family=Nunito:wght@600;700&family=Nunito+Sans:wght@400;600&display=swap",
  },
  {
    id: "heritage-crimson",
    label: "Heritage",
    description: "Classic book serif with practical sans",
    displayFamily: '"Crimson Pro", Georgia, serif',
    bodyFamily: '"Karla", system-ui, sans-serif',
    googleFontsHref:
      "https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@500;700&family=Karla:wght@400;600&display=swap",
  },
  {
    id: "modern-space",
    label: "Modern",
    description: "Contemporary grotesque with Inter body",
    displayFamily: '"Space Grotesk", system-ui, sans-serif',
    bodyFamily: '"Inter", system-ui, sans-serif',
    googleFontsHref:
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Space+Grotesk:wght@500;700&display=swap",
  },
  {
    id: "boutique-cormorant",
    label: "Boutique",
    description: "Refined display serif for curated brands",
    displayFamily: '"Cormorant Garamond", Georgia, serif',
    bodyFamily: '"Manrope", system-ui, sans-serif',
    googleFontsHref:
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;700&family=Manrope:wght@400;600&display=swap",
  },
  {
    id: "catalogue-plex",
    label: "Catalogue",
    description: "Efficient IBM Plex for dense product ranges",
    displayFamily: '"IBM Plex Sans", system-ui, sans-serif',
    bodyFamily: '"IBM Plex Sans", system-ui, sans-serif',
    googleFontsHref:
      "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600;700&display=swap",
  },
  {
    id: "studio-archivo",
    label: "Studio",
    description: "Maker-led display with soft serif body",
    displayFamily: '"Archivo", system-ui, sans-serif',
    bodyFamily: '"Source Serif 4", Georgia, serif',
    googleFontsHref:
      "https://fonts.googleapis.com/css2?family=Archivo:wght@600;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap",
  },
  {
    id: "local-libre",
    label: "Local",
    description: "Neighbourly serif headlines with Work Sans",
    displayFamily: '"Libre Baskerville", Georgia, serif',
    bodyFamily: '"Work Sans", system-ui, sans-serif',
    googleFontsHref:
      "https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Work+Sans:wght@400;600&display=swap",
  },
];

export function getFontPair(id: string | null | undefined): BrandFontPair | undefined {
  return BRAND_FONT_PAIRS.find((f) => f.id === id);
}

export function listFontPairs(): BrandFontPair[] {
  return BRAND_FONT_PAIRS;
}

/** Recommend a font pair from style feel + business mode. */
export function pickFontForMode(
  businessMode?: string,
  stylePreference?: string,
): string {
  const style = (stylePreference ?? "").toLowerCase();
  if (style.includes("bold") || style.includes("energetic")) return "bold-syne";
  if (style.includes("premium") || style.includes("handcrafted")) return "boutique-cormorant";
  if (style.includes("warm") || style.includes("local") || style.includes("rustic")) {
    return "local-libre";
  }
  if (style.includes("modern") || style.includes("clean")) return "modern-space";
  if (businessMode === "FOOD_BUSINESS") return "kiln-literata";
  if (businessMode === "FARM_STAND") return "orchard-serif";
  return "clean-dm";
}
