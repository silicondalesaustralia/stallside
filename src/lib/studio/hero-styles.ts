import type { HeroPreset } from "./preset-registry";
import type { StudioTemplateId } from "./types";

/** What a hero style needs to look finished; without it the style falls back or hides parts. */
export type HeroNeed = "photo" | "products" | "categories" | "menu" | "hours";

export type HeroStyleOption = { value: HeroPreset; label: string; hint: string; needs: HeroNeed[] };

/** Every hero style, offered in every template. */
export const HERO_STYLES: HeroStyleOption[] = [
  { value: "background", label: "Photo with text on top", hint: "Full-width photo with a dark fade behind the text", needs: ["photo"] },
  { value: "farm-landscape", label: "Landscape photo", hint: "Wide photo with a warm green fade", needs: ["photo"] },
  { value: "split", label: "Text beside photo", hint: "Text on one side, photo on the other", needs: ["photo"] },
  { value: "editorial", label: "Photo above text", hint: "Large photo with the text underneath", needs: ["photo"] },
  { value: "minimal", label: "Text only", hint: "Centred headline on a soft background", needs: [] },
  { value: "shop-first", label: "Text band with button", hint: "Compact band, button on the right", needs: [] },
  { value: "promo", label: "This week's offer", hint: "Compact band with a \"This week\" label", needs: [] },
  { value: "stand-status", label: "Opening status", hint: "Headline with an open-now badge from your hours", needs: ["hours"] },
  { value: "visit-us", label: "Visit us", hint: "Hours, open-now status and directions", needs: ["hours"] },
  { value: "product-collage", label: "Product collage", hint: "Four product photos beside the text", needs: ["products"] },
  { value: "featured-product", label: "Featured product", hint: "One product shown large with its price", needs: ["products"] },
  { value: "category-mosaic", label: "Category tiles", hint: "Your categories as large photo tiles", needs: ["categories"] },
  { value: "current-menu", label: "Current menu", hint: "Your current menu's title and description", needs: ["menu"] },
  { value: "countdown", label: "Next drop countdown", hint: "Live countdown until pre-orders close", needs: ["menu"] },
];

export const HERO_STYLE_VALUES: HeroPreset[] = HERO_STYLES.map((s) => s.value);

export type ResolvedHeroStyle = Exclude<HeroPreset, "simple">;

/** Older saved layouts ("simple", "spotlight") map onto a template's own style. */
export function resolveHeroStyle(templateId: StudioTemplateId, layout: string | undefined): ResolvedHeroStyle {
  if (layout === "simple" || layout === "spotlight") {
    return templateId === "market" ? "shop-first" : templateId === "farmhouse" ? "stand-status" : "editorial";
  }
  if (layout === "produce-split") return "produce-split";
  if (layout && (HERO_STYLE_VALUES as string[]).includes(layout)) return layout as ResolvedHeroStyle;
  if (templateId === "farmhouse") return "farm-landscape";
  if (templateId === "market") return "shop-first";
  return "background";
}

/** The picker value for a saved layout, so older layouts still show as selected. */
export function heroPickerValue(templateId: StudioTemplateId, layout: string | undefined): HeroPreset {
  const resolved = resolveHeroStyle(templateId, layout);
  return resolved === "produce-split" ? "split" : resolved;
}
