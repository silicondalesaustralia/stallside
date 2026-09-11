import type { BrandFontPair } from "@/lib/website/brand-fonts";
import type { WebsiteBlueprintId } from "./types";

/** Font pairs matching each starting style's brandKit typography. */
export const BLUEPRINT_FONT_PAIRS: BrandFontPair[] = [
  {
    id: "style-editorial",
    label: "Editorial",
    description: "Cormorant display with Work Sans body",
    displayFamily: '"Cormorant Garamond", Georgia, serif',
    bodyFamily: '"Work Sans", system-ui, sans-serif',
    googleFontsHref:
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;500;700&family=Work+Sans:wght@400;500;600&display=swap",
  },
  {
    id: "style-marketplace",
    label: "Marketplace",
    description: "Bitter headlines with Source Sans body",
    displayFamily: '"Bitter", Georgia, serif',
    bodyFamily: '"Source Sans 3", system-ui, sans-serif',
    googleFontsHref:
      "https://fonts.googleapis.com/css2?family=Bitter:wght@600;700&family=Source+Sans+3:wght@400;600&display=swap",
  },
  {
    id: "style-heritage",
    label: "Heritage",
    description: "Young Serif with Nunito Sans",
    displayFamily: '"Young Serif", Georgia, serif',
    bodyFamily: '"Nunito Sans", system-ui, sans-serif',
    googleFontsHref:
      "https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600&family=Young+Serif&display=swap",
  },
  {
    id: "style-minimal",
    label: "Minimal",
    description: "Jost display with Inter body",
    displayFamily: '"Jost", system-ui, sans-serif',
    bodyFamily: '"Inter", system-ui, sans-serif',
    googleFontsHref:
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Jost:wght@400;500;600&display=swap",
  },
  {
    id: "style-bold",
    label: "Bold",
    description: "Anton headlines with Space Grotesk",
    displayFamily: '"Anton", system-ui, sans-serif',
    bodyFamily: '"Space Grotesk", system-ui, sans-serif',
    googleFontsHref:
      "https://fonts.googleapis.com/css2?family=Anton&family=Space+Grotesk:wght@400;500;700&display=swap",
  },
  {
    id: "style-local",
    label: "Local",
    description: "Bricolage Grotesque with Figtree",
    displayFamily: '"Bricolage Grotesque", system-ui, sans-serif',
    bodyFamily: '"Figtree", system-ui, sans-serif',
    googleFontsHref:
      "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700&family=Figtree:wght@400;500;600&display=swap",
  },
  {
    id: "style-studio",
    label: "Studio",
    description: "Instrument Serif with Instrument Sans",
    displayFamily: '"Instrument Serif", Georgia, serif',
    bodyFamily: '"Instrument Sans", system-ui, sans-serif',
    googleFontsHref:
      "https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap",
  },
  {
    id: "style-modern-store",
    label: "Modern store",
    description: "Plus Jakarta Sans throughout",
    displayFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
    bodyFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
    googleFontsHref:
      "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700&display=swap",
  },
  {
    id: "style-catalogue",
    label: "Catalogue",
    description: "IBM Plex condensed + sans",
    displayFamily: '"IBM Plex Sans Condensed", system-ui, sans-serif',
    bodyFamily: '"IBM Plex Sans", system-ui, sans-serif',
    googleFontsHref:
      "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Sans+Condensed:wght@600&display=swap",
  },
  {
    id: "style-boutique",
    label: "Boutique",
    description: "Fraunces display with Karla body",
    displayFamily: '"Fraunces", Georgia, serif',
    bodyFamily: '"Karla", system-ui, sans-serif',
    googleFontsHref:
      "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,700&family=Karla:wght@400;500;600&display=swap",
  },
];

const BY_BLUEPRINT: Record<WebsiteBlueprintId, string> = {
  editorial: "style-editorial",
  marketplace: "style-marketplace",
  heritage: "style-heritage",
  minimal: "style-minimal",
  bold: "style-bold",
  local: "style-local",
  studio: "style-studio",
  "modern-store": "style-modern-store",
  catalogue: "style-catalogue",
  boutique: "style-boutique",
};

export function fontPairIdForBlueprint(id: WebsiteBlueprintId): string {
  return BY_BLUEPRINT[id];
}
