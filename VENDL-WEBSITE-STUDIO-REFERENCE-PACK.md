# VENDL — Website Studio Reference Pack

> For an external designer producing Phase 8D.1 starting-style reference designs.
> Generated from the codebase on **2026-09-11**. Cite paths only; no secrets or real seller data.
>
> **Critical caveat:** Craft Studio renders **3 design systems** (`artisan` | `farmhouse` | `market`).
> The AI gallery’s **10 starting styles** have richer blueprint `brandKit` / `layout` demos that only
> partially map into Craft (`designSystem` + presets + `themeOverrides`). Gallery look ≠ 1:1 Studio output.

## Contents

1. [Stack](#1-stack)
2. [Design systems](#2-design-systems)
3. [Section registry](#3-section-registry)
4. [Layout primitives](#4-layout-primitives)
5. [Style controls](#5-style-controls)
6. [Blueprints / starting styles](#6-blueprints--starting-styles)
7. [Sample WebsiteAISpec + Craft nodes](#7-sample-websiteaispec--craft-nodes)
8. [Data sources](#8-data-sources)
9. [Logo](#9-logo)
10. [Renderer constraints](#10-renderer-constraints)
11. [Phase 8D.1 status](#11-phase-8d1-status)
12. [Screenshots](#12-screenshots)
13. [Appendix — full source](#13-appendix--full-source)

---

## 1. Stack

| Item | Value | Path |
|------|-------|------|
| Framework | **Next.js 16.2.10** (App Router) | `package.json` |
| React | **19.2.4** | `package.json` |
| Craft.js | **@craftjs/core ^0.2.12** | `package.json` |
| Styling | **Tailwind CSS v4** (`@import "tailwindcss"`) + CSS custom properties + some inline styles | `src/app/globals.css`, `postcss.config.mjs` |
| Tailwind config file | **not present** (v4 CSS-first; no `tailwind.config.*`) | — |
| Fonts (app shell) | `next/font/google` — Inter + Geist Mono | `src/app/layout.tsx` |
| Studio fonts | Blueprint / themeOverride CSS vars (`--font-display`, `--font-body`) applied on public/editor shells | `src/lib/studio/public-render.tsx`, branding helpers |

### Craft.js wiring

| Role | Path |
|------|------|
| Editor (client) | `src/components/studio/StudioEditorInner.tsx` — `<Editor resolver={...}>` |
| Resolver map | `src/components/craft/resolver.ts` — maps section type names → components |
| Section rules | `src/lib/studio/section-registry.ts` |
| SSR / public storefront | `src/lib/studio/public-render.tsx` — Craft Frame + tokens + themeOverrides |
| Compile AI plan → nodes | `src/lib/website-ai/compile-nodes.ts` |
| Persist studio JSON | storefront studio document (engine `craft`) |

### SSR renderer notes

- Public pages hydrate Craft serialized nodes with `StudioMetadata` (products, categories, branding, theme).
- Design tokens from `TEMPLATE_TOKENS[templateId]` merged with seller `themeOverrides` (colours, fonts, `headerLayout`, `brandMark`).
- Nav/footer are **chrome**, not Craft nodes — rendered beside the Frame in public-render / editor shell.

---

## 2. Design systems

Studio has **exactly three** `StudioTemplateId` values. Source: `src/lib/studio/templates.ts`, tokens: `src/lib/studio/design-tokens.ts`.

| ID | Label | Header variant | Footer variant | Theme preset |
|----|-------|----------------|----------------|--------------|
| `artisan` | Artisan | `editorial` | `editorial-dark` | modern |
| `farmhouse` | Farmhouse | `farm-gate` | `farm-location` | farmhouse |
| `market` | Market | `commerce` | `compact` | market |

### Verbatim tokens (`ARTISAN_TOKENS` / `FARMHOUSE_TOKENS` / `MARKET_TOKENS`)


```ts src/lib/studio/design-tokens.ts
import type { CSSProperties } from "react";
import type { StudioTemplateId } from "./types";

/** Shared semantic design tokens — mapped to CSS custom properties on `.studio-template-*` */
export type SiteDesignTokens = {
  "--site-bg": string;
  "--site-surface": string;
  "--site-surface-alt": string;
  "--site-text": string;
  "--site-text-muted": string;
  "--site-accent": string;
  "--site-border": string;
  "--content-max": string;
  "--content-narrow": string;
  "--content-wide": string;
  "--space-section-desktop": string;
  "--space-section-mobile": string;
  "--radius-card": string;
  "--radius-button": string;
  "--shadow-card": string;
  "--image-product-ratio": string;
  "--image-category-ratio": string;
  "--studio-heading-tracking": string;
  "--studio-heading-weight": string;
  "--studio-hero-min-height": string;
  "--studio-hero-min-height-mobile": string;
  "--studio-btn-height": string;
  "--studio-prose-max": string;
};

export const ARTISAN_TOKENS: SiteDesignTokens = {
  "--site-bg": "#faf8f5",
  "--site-surface": "#ffffff",
  "--site-surface-alt": "#f3efe8",
  "--site-text": "#2a2118",
  "--site-text-muted": "#6b5f52",
  "--site-accent": "#b8860b",
  "--site-border": "#e8dfd3",
  "--content-max": "75rem",
  "--content-narrow": "42.5rem",
  "--content-wide": "85rem",
  "--space-section-desktop": "5.5rem",
  "--space-section-mobile": "3rem",
  "--radius-card": "1rem",
  "--radius-button": "9999px",
  "--shadow-card": "none",
  "--image-product-ratio": "4 / 5",
  "--image-category-ratio": "4 / 3",
  "--studio-heading-tracking": "-0.025em",
  "--studio-heading-weight": "700",
  "--studio-hero-min-height": "32rem",
  "--studio-hero-min-height-mobile": "24rem",
  "--studio-btn-height": "2.75rem",
  "--studio-prose-max": "42rem",
};

export const FARMHOUSE_TOKENS: SiteDesignTokens = {
  "--site-bg": "#f7f3ea",
  "--site-surface": "#fffef9",
  "--site-surface-alt": "#e8ebe3",
  "--site-text": "#1f2e1f",
  "--site-text-muted": "#5c6358",
  "--site-accent": "#a0522d",
  "--site-border": "#d4cfc0",
  "--content-max": "72rem",
  "--content-narrow": "40rem",
  "--content-wide": "80rem",
  "--space-section-desktop": "4.5rem",
  "--space-section-mobile": "2.75rem",
  "--radius-card": "0.75rem",
  "--radius-button": "0.5rem",
  "--shadow-card": "0 1px 3px rgb(0 0 0 / 0.06)",
  "--image-product-ratio": "1 / 1",
  "--image-category-ratio": "4 / 3",
  "--studio-heading-tracking": "-0.01em",
  "--studio-heading-weight": "650",
  "--studio-hero-min-height": "28rem",
  "--studio-hero-min-height-mobile": "22rem",
  "--studio-btn-height": "2.75rem",
  "--studio-prose-max": "40rem",
};

export const MARKET_TOKENS: SiteDesignTokens = {
  "--site-bg": "#fafafa",
  "--site-surface": "#ffffff",
  "--site-surface-alt": "#f4f4f5",
  "--site-text": "#18181b",
  "--site-text-muted": "#71717a",
  "--site-accent": "var(--leaf-dark)",
  "--site-border": "#e4e4e7",
  "--content-max": "80rem",
  "--content-narrow": "42rem",
  "--content-wide": "90rem",
  "--space-section-desktop": "3.5rem",
  "--space-section-mobile": "2.5rem",
  "--radius-card": "0.625rem",
  "--radius-button": "0.5rem",
  "--shadow-card": "0 1px 2px rgb(0 0 0 / 0.05)",
  "--image-product-ratio": "1 / 1",
  "--image-category-ratio": "3 / 2",
  "--studio-heading-tracking": "-0.015em",
  "--studio-heading-weight": "700",
  "--studio-hero-min-height": "20rem",
  "--studio-hero-min-height-mobile": "16rem",
  "--studio-btn-height": "2.5rem",
  "--studio-prose-max": "42rem",
};

export const TEMPLATE_TOKENS: Record<StudioTemplateId, SiteDesignTokens> = {
  artisan: ARTISAN_TOKENS,
  farmhouse: FARMHOUSE_TOKENS,
  market: MARKET_TOKENS,
};

export function tokensToStyle(tokens: SiteDesignTokens): CSSProperties & Record<string, string> {
  return {
    ...tokens,
    "--studio-content-max": tokens["--content-max"],
    "--studio-section-py": tokens["--space-section-desktop"],
    "--studio-section-py-mobile": tokens["--space-section-mobile"],
    "--studio-card-radius": tokens["--radius-card"],
  };
}
```


### Template definitions (structure)

`STUDIO_TEMPLATES` in `src/lib/studio/templates.ts` maps each id → `cssClass` (`studio-template-*`), `style: tokensToStyle(...)`, audience copy, and recommended `BusinessMode`.

---

## 3. Section registry

Source: `src/lib/studio/section-registry.ts`.

| type | label | category | notes |
|------|-------|----------|-------|
| CraftHeroSection | Hero | content | singleton, required, homeOnly, not deletable |
| CraftProductDetailSection | Product detail | sell | commerceKinds: product |
| CraftMenuDetailSection | Menu detail | sell | commerceKinds: menu |
| CraftProductGridSection | Products | sell | duplicable |
| CraftCategoriesSection | Categories | sell | singleton |
| CraftNextDropSection | Next drop | sell | FOOD_BUSINESS / BOTH |
| CraftTextSection | Text | content | |
| CraftImageSection | Image | content | |
| CraftImageTextSection | Image + text | content | |
| CraftAboutSection | About | trust | singleton |
| CraftReviewsSection | Reviews | trust | singleton |
| CraftPickupSection | Pickup & delivery | trust | singleton |
| CraftSignupSection | Subscriber signup | grow | singleton |
| CraftFarmStandSection | Farm stand | trust | FARM_STAND / BOTH |

Plus resolver-only root: `CraftPageRoot`.

### Component mapping (section → block)

| Craft section | Primary block / chrome |
|---------------|------------------------|
| CraftHeroSection | StudioHeroBlock (`src/components/studio/blocks/StudioHeroBlock.tsx`) |
| CraftProductGridSection | StudioProductsBlock |
| CraftCategoriesSection | StudioCategoriesBlock |
| Nav (not a section) | StudioStorefrontNav |
| Footer (not a section) | StudioStorefrontFooter |

Full source for nav / hero / product grid / category / footer: [§13](#13-appendix--full-source).

### Presets

`src/lib/studio/preset-registry.ts` — hero presets include `background`, `split`, `editorial`, `minimal`, `shop-first`, `promo`, `product-collage`, farm-landscape, etc. Product / category / next-drop presets similarly constrained.

Blueprint → Craft hero mapping: `src/lib/website-ai/blueprint-hero-preset.ts`.

---

## 4. Layout primitives

| Primitive | Present? | Notes |
|-----------|----------|-------|
| Shared section chrome | **yes** | `CraftSectionChrome` — padding via token CSS vars |
| Content max width | **yes** | `--content-max` / `--content-narrow` / `--content-wide` on template |
| Grid systems | **partial** | Tailwind utility grids inside blocks; no shared Grid primitive component |
| Stack / spacer | **not present** as named primitives | spacing via section tokens + Tailwind |
| Card primitive | **not present** as shared component | card radius/shadow from tokens; blocks implement their own |
| Image aspect | **yes (tokens)** | `--image-product-ratio`, `--image-category-ratio` |
| Blueprint layout DSL | **yes (gallery)** | `BlueprintLayout` in `src/lib/website/blueprints/layout-types.ts` — **not** a Craft layout engine |

**Inferred:** Designers should treat Craft as section stack + presets, not as freeform CSS layout.

---

## 5. Style controls

Editable / overridable surfaces:

| Control | Where stored | UI |
|---------|--------------|-----|
| Design system (template) | studio document `templateId` | template selector |
| Accent / secondary / bg colours | `themeOverrides` on storefront | branding forms |
| Display / body fonts | `themeOverrides` + Google font load | branding / AI finalize |
| Header layout | `themeOverrides.headerLayout`: `classic` \| `centred` \| `stacked` \| `minimal` | click header in studio |
| Brand mark | `themeOverrides.brandMark`: `logo-and-name` \| `logo-only` \| `name-only` | same |
| Section props (headline, preset, …) | Craft node props | settings panels |
| Blueprint gallery look | **not** fully editable in Craft | AI gallery only |

Mapping blueprint header → studio: `src/lib/storefront/header-style.ts`:


```ts src/lib/storefront/header-style.ts
import type { HeaderPattern } from "@/lib/website/blueprints/layout-types";

export const HEADER_LAYOUTS = ["classic", "centred", "stacked", "minimal"] as const;
export type HeaderLayout = (typeof HEADER_LAYOUTS)[number];

export const BRAND_MARK_MODES = ["logo-and-name", "logo-only", "name-only"] as const;
export type BrandMarkMode = (typeof BRAND_MARK_MODES)[number];

export function isHeaderLayout(value: unknown): value is HeaderLayout {
  return typeof value === "string" && (HEADER_LAYOUTS as readonly string[]).includes(value);
}

export function isBrandMarkMode(value: unknown): value is BrandMarkMode {
  return typeof value === "string" && (BRAND_MARK_MODES as readonly string[]).includes(value);
}

export function defaultHeaderStyle(hasLogo: boolean): {
  headerLayout: HeaderLayout;
  brandMark: BrandMarkMode;
} {
  return {
    headerLayout: "classic",
    brandMark: hasLogo ? "logo-and-name" : "name-only",
  };
}

/** Map starting-style blueprint header pattern → studio header settings. */
export function headerStyleFromBlueprint(
  pattern: HeaderPattern,
  hasLogo: boolean,
): { headerLayout: HeaderLayout; brandMark: BrandMarkMode } {
  const defaults = defaultHeaderStyle(hasLogo);
  switch (pattern) {
    case "CENTRED":
      return { headerLayout: "centred", brandMark: defaults.brandMark };
    case "STACKED":
    case "INFO_BAR":
      return { headerLayout: "stacked", brandMark: defaults.brandMark };
    case "MINIMAL_ICON":
      return {
        headerLayout: "minimal",
        brandMark: hasLogo ? "logo-only" : "name-only",
      };
    case "CLASSIC":
    case "UTILITY_SEARCH":
    case "BOLD_BAR":
    default:
      return defaults;
  }
}

export const HEADER_LAYOUT_LABELS: Record<HeaderLayout, string> = {
  classic: "Classic",
  centred: "Centred",
  stacked: "Stacked",
  minimal: "Minimal",
};

export const BRAND_MARK_LABELS: Record<BrandMarkMode, string> = {
  "logo-and-name": "Logo and name",
  "logo-only": "Logo only",
  "name-only": "Name only",
};
```


Types: `src/lib/storefront/types.ts` (`StorefrontThemeOverrides`).

---

## 6. Blueprints / starting styles

Ten IDs: `editorial`, `marketplace`, `heritage`, `minimal`, `bold`, `local`, `studio`, `modern-store`, `catalogue`, `boutique`.

Registry: `src/lib/website/blueprints/registry.ts`  
Layouts (verbatim): `src/lib/website/blueprints/layouts.ts`  
Brand kits (verbatim): `src/lib/website/blueprints/brand-kits.ts`  
Recommend: `src/lib/website/blueprints/recommend.ts`

### Blueprint → Craft designSystem

| Blueprint | designSystem | Preferred hero (registry) |
|-----------|--------------|---------------------------|
| editorial | artisan | editorial |
| marketplace | market | shop-first |
| heritage | farmhouse | split |
| minimal | artisan | minimal |
| bold | market | promo |
| local | farmhouse | background |
| studio | artisan | editorial |
| modern-store | market | shop-first |
| catalogue | market | product-collage |
| boutique | artisan | editorial |

### Verbatim layouts


```ts src/lib/website/blueprints/layouts.ts
import type { BlueprintLayout } from "./layout-types";
import type { WebsiteBlueprintId } from "./types";

export const BLUEPRINT_LAYOUTS: Record<WebsiteBlueprintId, BlueprintLayout> = {
  editorial: {
    header: "CENTRED",
    hero: "EDITORIAL_STACK",
    merch: "FEATURE_ROWS_LARGE_GRID",
    gridColumns: { desktop: 3, mobile: 1 },
    cardTreatment: "BORDERLESS",
    imageShape: "RECT",
    sectionSpacing: "XL",
    colourMode: "WARM",
  },
  marketplace: {
    header: "CLASSIC",
    hero: "SPLIT_CATEGORY_TILES",
    merch: "CATEGORY_ROWS",
    gridColumns: { desktop: "SCROLL_ROW", mobile: "SCROLL_ROW" },
    cardTreatment: "TINTED",
    imageShape: "ROUNDED",
    sectionSpacing: "M",
    colourMode: "LIGHT",
  },
  heritage: {
    header: "STACKED",
    hero: "ARCH_FRAME",
    merch: "STORY_COLUMNS_MENU_LIST",
    gridColumns: { desktop: "LIST", mobile: "LIST" },
    cardTreatment: "LIST_ROW",
    imageShape: "ARCH",
    sectionSpacing: "L",
    colourMode: "TINTED",
  },
  minimal: {
    header: "MINIMAL_ICON",
    hero: "FRAMED_INSET",
    merch: "LARGE_GRID_2",
    gridColumns: { desktop: 2, mobile: 1 },
    cardTreatment: "BORDERLESS",
    imageShape: "RECT",
    sectionSpacing: "XXL",
    colourMode: "LIGHT",
  },
  bold: {
    header: "BOLD_BAR",
    hero: "TYPE_BLOCK",
    merch: "COLOUR_BLOCKS_GRID_4",
    gridColumns: { desktop: 4, mobile: 2 },
    cardTreatment: "THICK_BORDER",
    imageShape: "CUTOUT",
    sectionSpacing: "S",
    colourMode: "DARK",
  },
  local: {
    header: "INFO_BAR",
    hero: "FULL_BLEED",
    merch: "AVAILABLE_NOW",
    gridColumns: { desktop: 3, mobile: 2 },
    cardTreatment: "SOFT_SHADOW",
    imageShape: "ROUNDED",
    sectionSpacing: "M",
    colourMode: "WARM",
  },
  studio: {
    header: "MINIMAL_ICON",
    hero: "COLLAGE_TRIO",
    merch: "GALLERY_PROCESS",
    gridColumns: { desktop: "MASONRY", mobile: "MASONRY" },
    cardTreatment: "CAPTIONED",
    imageShape: "MIXED_RATIO",
    sectionSpacing: "L",
    colourMode: "STONE",
  },
  "modern-store": {
    header: "CLASSIC",
    hero: "SPLIT_MEDIA",
    merch: "TABBED_GRID_4",
    gridColumns: { desktop: 4, mobile: 2 },
    cardTreatment: "HAIRLINE",
    imageShape: "ROUNDED",
    sectionSpacing: "M",
    colourMode: "LIGHT",
  },
  catalogue: {
    header: "UTILITY_SEARCH",
    hero: "PROMO_BANNER",
    merch: "DENSE_GRID_6",
    gridColumns: { desktop: 6, mobile: 2 },
    cardTreatment: "COMPACT_HAIRLINE",
    imageShape: "RECT",
    sectionSpacing: "S",
    colourMode: "LIGHT",
  },
  boutique: {
    header: "CENTRED",
    hero: "PRODUCT_FEATURE",
    merch: "CURATED_SETS",
    gridColumns: { desktop: 3, mobile: 2 },
    cardTreatment: "TINTED_PANEL",
    imageShape: "ROUNDED_LG",
    sectionSpacing: "L",
    colourMode: "BLUSH",
  },
};
```


### Verbatim brand kits


```ts src/lib/website/blueprints/brand-kits.ts
import type { BlueprintBrandKit } from "./layout-types";
import type { WebsiteBlueprintId } from "./types";

function kit(
  partial: BlueprintBrandKit,
): BlueprintBrandKit {
  return partial;
}

export const BLUEPRINT_BRAND_KITS: Record<WebsiteBlueprintId, BlueprintBrandKit> = {
  editorial: kit({
    palette: {
      background: "#FAF8F4", surface: "#F0EBE3", text: "#1C1B19", muted: "#6B655D",
      primary: "#1C1B19", onPrimary: "#FAF8F4", accent: "#9A5B3C", onAccent: "#FAF8F4",
    },
    typography: {
      display: { family: "Cormorant Garamond", weights: [300, 500] },
      body: { family: "Work Sans", weights: [400, 500] },
      scaleRatio: 1.5, headingCase: "SENTENCE", headingTrackingEm: -0.01,
    },
    logoPlacement: {
      alignment: "CENTRE", plate: "NONE", maxHeightPx: 40, footerMaxHeightPx: 28,
      wordmark: { font: "DISPLAY", case: "UPPER", trackingEm: 0.2, longName: "SCALE" },
    },
    shape: { radiusPx: 0, buttonStyle: "SQUARE" },
  }),
  marketplace: kit({
    palette: {
      background: "#FFFFFF", surface: "#F1F4EC", text: "#1E2A1E", muted: "#56634F",
      primary: "#2F6B3A", onPrimary: "#FFFFFF", accent: "#F2B33D", onAccent: "#1E2A1E",
    },
    typography: {
      display: { family: "Bitter", weights: [600, 700] },
      body: { family: "Source Sans 3", weights: [400, 600] },
      scaleRatio: 1.25, headingCase: "SENTENCE", headingTrackingEm: 0,
    },
    logoPlacement: {
      alignment: "LEFT", plate: "NONE", maxHeightPx: 40, footerMaxHeightPx: 28,
      wordmark: { font: "DISPLAY", case: "AS_IS", trackingEm: 0, longName: "SCALE" },
    },
    shape: { radiusPx: 12, buttonStyle: "ROUNDED" },
  }),
  heritage: kit({
    palette: {
      background: "#F4ECDF", surface: "#FBF6EE", text: "#3B2A1E", muted: "#6E5A48",
      primary: "#7A3E24", onPrimary: "#FBF6EE", accent: "#5E6B3A", onAccent: "#F4ECDF",
    },
    typography: {
      display: { family: "Young Serif", weights: [400] },
      body: { family: "Nunito Sans", weights: [400, 600] },
      scaleRatio: 1.333, headingCase: "TITLE", headingTrackingEm: 0,
    },
    logoPlacement: {
      alignment: "CENTRE_ABOVE_NAV", plate: "NONE", maxHeightPx: 56, footerMaxHeightPx: 36,
      wordmark: { font: "DISPLAY", case: "UPPER", trackingEm: 0.18, longName: "SCALE" },
    },
    shape: { radiusPx: 4, buttonStyle: "DOUBLE_OUTLINE" },
  }),
  minimal: kit({
    palette: {
      background: "#FFFFFF", surface: "#F5F5F4", text: "#111111", muted: "#6B6B67",
      primary: "#111111", onPrimary: "#FFFFFF", accent: "#B8B8B2", onAccent: "#111111",
    },
    typography: {
      display: { family: "Jost", weights: [400, 500] },
      body: { family: "Inter", weights: [400] },
      scaleRatio: 1.2, headingCase: "UPPER", headingTrackingEm: 0.12,
    },
    logoPlacement: {
      alignment: "LEFT", plate: "NONE", maxHeightPx: 28, footerMaxHeightPx: 22,
      wordmark: { font: "DISPLAY", case: "UPPER", trackingEm: 0.3, longName: "SCALE" },
    },
    shape: { radiusPx: 0, buttonStyle: "TEXT_LINK" },
  }),
  bold: kit({
    palette: {
      background: "#111111", surface: "#1F1F1F", text: "#FFFFFF", muted: "#B3B3B3",
      primary: "#FF5A1F", onPrimary: "#111111", accent: "#D7F75B", onAccent: "#111111",
    },
    typography: {
      display: { family: "Anton", weights: [400] },
      body: { family: "Space Grotesk", weights: [400, 500] },
      scaleRatio: 1.618, headingCase: "UPPER", headingTrackingEm: 0,
    },
    logoPlacement: {
      alignment: "LEFT", plate: "STICKER", maxHeightPx: 36, footerMaxHeightPx: 28,
      wordmark: { font: "DISPLAY", case: "UPPER", trackingEm: 0, longName: "SCALE" },
    },
    shape: { radiusPx: 0, buttonStyle: "OFFSET_SHADOW" },
  }),
  local: kit({
    palette: {
      background: "#FFFBF2", surface: "#FFF1CC", text: "#2A2A22", muted: "#5F5B4A",
      primary: "#B8412A", onPrimary: "#FFFFFF", accent: "#2F6D4F", onAccent: "#FFFBF2",
    },
    typography: {
      display: { family: "Bricolage Grotesque", weights: [600, 700] },
      body: { family: "Figtree", weights: [400, 500] },
      scaleRatio: 1.25, headingCase: "SENTENCE", headingTrackingEm: 0,
    },
    logoPlacement: {
      alignment: "LEFT", plate: "BADGE", maxHeightPx: 44, footerMaxHeightPx: 32,
      wordmark: { font: "DISPLAY", case: "AS_IS", trackingEm: 0, longName: "STACK" },
    },
    shape: { radiusPx: 16, buttonStyle: "PILL" },
  }),
  studio: kit({
    palette: {
      background: "#EFEDE8", surface: "#FFFFFF", text: "#22211F", muted: "#66625B",
      primary: "#22211F", onPrimary: "#EFEDE8", accent: "#3D5A80", onAccent: "#EFEDE8",
    },
    typography: {
      display: { family: "Instrument Serif", weights: [400], italic: true },
      body: { family: "Instrument Sans", weights: [400, 500] },
      scaleRatio: 1.414, headingCase: "SENTENCE", headingTrackingEm: 0,
    },
    logoPlacement: {
      alignment: "LEFT", plate: "NONE", maxHeightPx: 32, footerMaxHeightPx: 24,
      wordmark: { font: "DISPLAY", case: "LOWER", trackingEm: 0, longName: "SCALE" },
    },
    shape: { radiusPx: 2, buttonStyle: "TEXT_LINK" },
  }),
  "modern-store": kit({
    palette: {
      background: "#FFFFFF", surface: "#F2F4F7", text: "#101828", muted: "#475467",
      primary: "#0F3D3E", onPrimary: "#FFFFFF", accent: "#F4A259", onAccent: "#101828",
    },
    typography: {
      display: { family: "Plus Jakarta Sans", weights: [700] },
      body: { family: "Plus Jakarta Sans", weights: [400, 500] },
      scaleRatio: 1.25, headingCase: "SENTENCE", headingTrackingEm: 0,
    },
    logoPlacement: {
      alignment: "LEFT", plate: "NONE", maxHeightPx: 36, footerMaxHeightPx: 28,
      wordmark: { font: "DISPLAY", case: "AS_IS", trackingEm: 0, longName: "SCALE" },
    },
    shape: { radiusPx: 8, buttonStyle: "ROUNDED" },
  }),
  catalogue: kit({
    palette: {
      background: "#FFFFFF", surface: "#F6F7F8", text: "#1A1D21", muted: "#5B616B",
      primary: "#1A1D21", onPrimary: "#FFFFFF", accent: "#D6331F", onAccent: "#FFFFFF",
    },
    typography: {
      display: { family: "IBM Plex Sans Condensed", weights: [600] },
      body: { family: "IBM Plex Sans", weights: [400, 500] },
      scaleRatio: 1.125, headingCase: "SENTENCE", headingTrackingEm: 0,
    },
    logoPlacement: {
      alignment: "LEFT", plate: "NONE", maxHeightPx: 28, footerMaxHeightPx: 22,
      wordmark: { font: "DISPLAY", case: "AS_IS", trackingEm: 0, longName: "SCALE" },
    },
    shape: { radiusPx: 4, buttonStyle: "ROUNDED" },
  }),
  boutique: kit({
    palette: {
      background: "#FCF7F5", surface: "#F3E3DE", text: "#3D2B2E", muted: "#735B5F",
      primary: "#8C4B5A", onPrimary: "#FFFFFF", accent: "#C6A27A", onAccent: "#3D2B2E",
    },
    typography: {
      display: { family: "Fraunces", weights: [400] },
      body: { family: "Karla", weights: [400, 500] },
      scaleRatio: 1.333, headingCase: "SENTENCE", headingTrackingEm: 0,
    },
    logoPlacement: {
      alignment: "CENTRE", plate: "NONE", maxHeightPx: 44, footerMaxHeightPx: 32,
      wordmark: { font: "DISPLAY", case: "AS_IS", trackingEm: 0, longName: "SCALE" },
    },
    shape: { radiusPx: 24, buttonStyle: "PILL" },
  }),
};
```


### Recommend summary

`recommendWebsiteBlueprints` scores blueprints from business context (mode, photo count, categories, etc.). Image-led styles are deprioritised when `productPhotoCount` is low. Returns ordered suggestions for the AI style picker — **not** a Craft layout chooser.

---

## 7. Sample WebsiteAISpec + Craft nodes

**Demo tenant only:** Green Valley Farm & Bakes (synthetic). Generated via `planSiteHeuristic` + `compilePlanToStudioPayload` with `blueprintId: "local"`.

Business context used:


```json
{
  "ownerId": "demo_owner",
  "businessMode": "BOTH",
  "businessName": "Green Valley Farm & Bakes",
  "headline": "Green Valley Farm & Bakes",
  "subheadline": "Farm stand eggs and weekly sourdough",
  "about": "We grow and bake for our local community.",
  "regionLabel": "Adelaide Hills",
  "hasFarmStand": true,
  "hasMenus": true,
  "hasDelivery": true,
  "hasPickup": true,
  "productCount": 12,
  "categoryCount": 4,
  "reviewCount": 3,
  "categories": [
    {
      "id": "c1",
      "title": "Eggs",
      "slug": "eggs"
    }
  ],
  "featuredProducts": [
    {
      "id": "p1",
      "title": "Farm eggs"
    }
  ],
  "productPhotoCount": 8,
  "logoUrl": null,
  "heroImageUrl": null,
  "accentColor": null,
  "secondaryColor": null,
  "existingTemplateId": null,
  "hasExistingStudio": false
}
```


### Plan (`WebsiteAISpec`-shaped output from heuristic)


```json
{
  "version": 1,
  "designSystem": "farmhouse",
  "siteStrategy": {
    "primaryGoal": "farm-stand",
    "audienceSummary": "Local customers near Adelaide Hills",
    "contentPriorities": [
      "Hero",
      "FarmStand",
      "NextDrop",
      "Pickup",
      "ImageText",
      "Signup"
    ]
  },
  "navigation": [
    {
      "label": "Home",
      "pageType": "HOME"
    },
    {
      "label": "Shop",
      "pageType": "SHOP"
    },
    {
      "label": "Farm stand",
      "pageType": "FARM_STAND"
    },
    {
      "label": "About",
      "pageType": "ABOUT"
    },
    {
      "label": "Contact",
      "pageType": "CONTACT"
    }
  ],
  "pages": [
    {
      "pageType": "HOME",
      "title": "Home",
      "sections": [
        {
          "id": "hero-0",
          "type": "Hero",
          "headline": "Green Valley Farm & Bakes",
          "subheadline": "Farm stand eggs and weekly sourdough",
          "ctaLabel": "Browse",
          "preset": "background",
          "copyKind": "GENERIC"
        },
        {
          "id": "stand-1",
          "type": "FarmStand",
          "heading": "Visit the stand",
          "visibility": "ALL",
          "preset": "visit"
        },
        {
          "id": "drop-2",
          "type": "NextDrop",
          "heading": "Next collection",
          "dataSource": "NEXT_DROP"
        },
        {
          "id": "pickup-3",
          "type": "Pickup",
          "heading": "Location & pickup",
          "dataSource": "DELIVERY_ZONES",
          "visibility": "ALL",
          "preset": "cards"
        },
        {
          "id": "story-4",
          "type": "ImageText",
          "heading": "Our story",
          "body": "We grow and bake for our local community.",
          "copyKind": "SELLER"
        },
        {
          "id": "signup-5",
          "type": "Signup",
          "heading": "Join the farm list",
          "body": "Get updates when new products and menus are available.",
          "ctaLabel": "Subscribe",
          "dataSource": "SIGNUP_DESTINATION",
          "copyKind": "GENERIC"
        }
      ],
      "seo": {
        "title": "Green Valley Farm & Bakes · Adelaide Hills",
        "description": "Farm stand eggs and weekly sourdough"
      }
    },
    {
      "pageType": "ABOUT",
      "title": "About",
      "slug": "about",
      "sections": [
        {
          "id": "about-main",
          "type": "About",
          "heading": "About Green Valley Farm & Bakes",
          "body": "We grow and bake for our local community.",
          "copyKind": "SELLER"
        }
      ]
    },
    {
      "pageType": "CONTACT",
      "title": "Contact",
      "slug": "contact",
      "sections": [
        {
          "id": "contact-main",
          "type": "Text",
          "heading": "Get in touch",
          "body": "Questions? Get in touch.",
          "copyKind": "GENERIC",
          "placeholderKind": "COPY_GENERIC"
        }
      ]
    }
  ],
  "changeSummary": "Draft farmhouse · Local starting style · local_visit layout focused on farm-stand."
}
```


### Compiled Craft payload (nodes)


```json
{
  "templateId": "farmhouse",
  "engine": "craft",
  "version": 2,
  "nodes": {
    "hero-0": {
      "type": {
        "resolvedName": "CraftHeroSection"
      },
      "isCanvas": false,
      "props": {
        "headline": "Green Valley Farm & Bakes",
        "supportingText": "Farm stand eggs and weekly sourdough",
        "layout": "background",
        "ctaLabel": "Browse",
        "showCta": true
      },
      "displayName": "CraftHeroSection",
      "custom": {
        "aiSectionId": "hero-0",
        "aiType": "Hero",
        "visibility": "ALL",
        "productPresentation": "LIVE",
        "copyKind": "GENERIC"
      },
      "hidden": false,
      "nodes": [],
      "linkedNodes": {},
      "parent": "ROOT"
    },
    "stand-1": {
      "type": {
        "resolvedName": "CraftFarmStandSection"
      },
      "isCanvas": false,
      "props": {
        "heading": "Visit the stand",
        "showHours": true,
        "showLocation": true,
        "showDirections": true
      },
      "displayName": "CraftFarmStandSection",
      "custom": {
        "aiSectionId": "stand-1",
        "aiType": "FarmStand",
        "visibility": "ALL",
        "productPresentation": "LIVE"
      },
      "hidden": false,
      "nodes": [],
      "linkedNodes": {},
      "parent": "ROOT"
    },
    "drop-2": {
      "type": {
        "resolvedName": "CraftNextDropSection"
      },
      "isCanvas": false,
      "props": {
        "maxItems": 1,
        "showClosingDate": true,
        "showPickupDate": true,
        "preset": "next-collection",
        "heading": "Next collection"
      },
      "displayName": "CraftNextDropSection",
      "custom": {
        "aiSectionId": "drop-2",
        "aiType": "NextDrop",
        "visibility": "ALL",
        "productPresentation": "LIVE"
      },
      "hidden": false,
      "nodes": [],
      "linkedNodes": {},
      "parent": "ROOT"
    },
    "pickup-3": {
      "type": {
        "resolvedName": "CraftPickupSection"
      },
      "isCanvas": false,
      "props": {
        "preset": "cards",
        "heading": "Location & pickup"
      },
      "displayName": "CraftPickupSection",
      "custom": {
        "aiSectionId": "pickup-3",
        "aiType": "Pickup",
        "visibility": "ALL",
        "productPresentation": "LIVE"
      },
      "hidden": false,
      "nodes": [],
      "linkedNodes": {},
      "parent": "ROOT"
    },
    "story-4": {
      "type": {
        "resolvedName": "CraftImageTextSection"
      },
      "isCanvas": false,
      "props": {
        "imageUrl": "",
        "heading": "Our story",
        "body": "We grow and bake for our local community.",
        "layout": "image-left",
        "ctaLabel": ""
      },
      "displayName": "CraftImageTextSection",
      "custom": {
        "aiSectionId": "story-4",
        "aiType": "ImageText",
        "visibility": "ALL",
        "productPresentation": "LIVE",
        "copyKind": "SELLER"
      },
      "hidden": false,
      "nodes": [],
      "linkedNodes": {},
      "parent": "ROOT"
    },
    "signup-5": {
      "type": {
        "resolvedName": "CraftSignupSection"
      },
      "isCanvas": false,
      "props": {
        "heading": "Join the farm list",
        "body": "Get updates when new products and menus are available.",
        "buttonLabel": "Subscribe"
      },
      "displayName": "CraftSignupSection",
      "custom": {
        "aiSectionId": "signup-5",
        "aiType": "Signup",
        "visibility": "ALL",
        "productPresentation": "LIVE",
        "copyKind": "GENERIC"
      },
      "hidden": false,
      "nodes": [],
      "linkedNodes": {},
      "parent": "ROOT"
    },
    "ROOT": {
      "type": {
        "resolvedName": "CraftPageRoot"
      },
      "isCanvas": true,
      "props": {},
      "displayName": "CraftPageRoot",
      "custom": {
        "source": "website-ai",
        "planVersion": 1,
        "pageType": "HOME"
      },
      "hidden": false,
      "nodes": [
        "hero-0",
        "stand-1",
        "drop-2",
        "pickup-3",
        "story-4",
        "signup-5"
      ],
      "linkedNodes": {},
      "parent": null
    }
  }
}
```


Also saved locally as `reference-pack-sample.json` (scratch; not part of the pack contract).

---

## 8. Data sources

Sections bind to live seller data through `StudioMetadata` / public-render loaders — **not** hard-coded in Craft props (except AI-seeded copy).

| Section | Data |
|---------|------|
| Product grid | products from catalog; filters via props (`source`, ids, preset) |
| Categories | category list |
| Reviews | review quotes when present |
| Next drop | next order window |
| Pickup | delivery zones / pickup info |
| Farm stand | stand location / hours / availability |
| Signup | subscriber destination |
| About / Text / ImageText | AI or seller copy in node props; images from blob/CDN URLs |
| Nav | page list + branding name/logo |
| Footer | business name, links, location copy — **name text; no logo image** |

Demo kits for gallery only: `src/lib/website/demo-kits/`, assets under `public/demo/kits/`.

---

## 9. Logo

| Topic | Detail | Path |
|-------|--------|------|
| Upload | Owner branding form; blob storage | `src/components/...` BrandingForm, `brand-asset-upload.ts` |
| Max size | **900 KB** (`LOGO_IMAGE_MAX_BYTES`) | `src/lib/image-upload-limits.ts` |
| Formats | JPEG, PNG, WebP (hint string) | same |
| Header | Shows per `brandMark` + `logoUrl` | `StudioStorefrontNav.tsx` |
| Footer | **Business name text only** — logo **not present** in footer chrome | `StudioStorefrontFooter.tsx` |
| Blueprint logoPlacement | Gallery / brand-kit field; partial map via header style | `brand-kits.ts`, `logo-placement.ts` |

---

## 10. Renderer constraints

What Craft **can** do today:

- Three tokenised design systems + themeOverrides (colour, font, header layout/brand mark).
- Ordered stack of registered sections with presets.
- Live product/category/commerce bindings.
- Hero image URL + layout preset (including full-bleed `background`).

What it **cannot** faithfully reproduce from gallery blueprints alone:

- Unique blueprint merch layouts (`FEATURE_ROWS_LARGE_GRID`, `MASONRY`, `DENSE_GRID_6`, etc.) as first-class Craft layouts.
- Per-blueprint header patterns beyond the 4 studio layouts.
- Gallery-only decorative treatments (arch frames, collage trios, type-block heroes) unless a Craft preset exists.
- Footer logo plates / sticker treatments from `logoPlacement`.

**Inferred for designers:** Reference comps for starting styles should prefer: one of 3 systems + mapped header layout + available hero/product/category presets + brand colours/fonts. Extra gallery chrome is aspirational unless built into Craft.

---

## 11. Phase 8D.1 status

`VENDL-PHASE-8D1-STARTING-STYLE-DEMOS.md` — **not present**.

Authoritative result doc: `VENDL-PHASE-8D1-STARTING-STYLE-DEMOS-RESULT.md`.

| Item | Status |
|------|--------|
| 10-style gallery with shared demo kits | **done** |
| Blueprint `layout` + `brandKit` | **done** |
| Distinctness tests / card meta | **done** |
| Seed kit images + brand on AI finalize | **done** (post-result follow-up) |
| Editable header styles in studio | **done** (post-result) |
| Blueprint hero → Craft preset | **done** (post-result) |
| Playwright captures / contact sheets / SHA manifests | **not started** (called out as follow-up) |
| Craft 1:1 fidelity to all 10 gallery looks | **partial** — designSystem + overrides + presets only |
| 8D.2 “Preview with my products” | **not in this pass** |

---

## 12. Screenshots

Target directory: `reference-pack/screenshots/`

| File pattern | Viewport | Status |
|--------------|----------|--------|
| `<styleId>-desktop.png` | 1440×900 | **not present** (capture pending) |
| `<styleId>-mobile.png` | 390×844 | **not present** (capture pending) |

Styles: `editorial`, `marketplace`, `heritage`, `minimal`, `bold`, `local`, `studio`, `modern-store`, `catalogue`, `boutique`.

**Inferred capture surface:** AI gallery `BlueprintHomepagePreview` (demo kit), not Craft public-render — unless capturing finalized draft storefronts.

---

## 13. Appendix — full source

Requested components (header/nav, hero, product grid, category grid, footer). Craft wrappers included where the section is a thin adapter over the studio block.


### `src/components/studio/shell/StudioStorefrontNav.tsx`


```tsx src/components/studio/shell/StudioStorefrontNav.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useSyncExternalStore, useCallback, type ReactNode } from "react";
import {
  cartItemCount,
  getStandCartEpoch,
  readStandCartLines,
  subscribeStandCart,
} from "@/lib/stand-cart-storage";
import { standCartPath } from "@/lib/stand-seo";
import { shopHomePath, shopMenusPath, shopPagePath } from "@/lib/storefront/paths";
import type { StorefrontPageId, ResolvedStorefrontBranding } from "@/lib/storefront/types";
import type { StudioTemplateId } from "@/lib/studio/types";
import type { StudioNavItem } from "@/lib/studio/navigation";
import { resolveStudioTemplate } from "@/lib/studio/templates";
import type { BrandMarkMode, HeaderLayout } from "@/lib/storefront/header-style";

const SHOP_LABEL: Record<StudioTemplateId, string> = {
  artisan: "Shop",
  farmhouse: "What's available",
  market: "Shop",
};

function NavDropdown({ item }: { item: StudioNavItem }) {
  if (!item.children?.length) {
    return (
      <Link href={item.href} className="studio-nav__link">
        {item.label}
      </Link>
    );
  }
  return (
    <div className="group relative">
      <button type="button" className="studio-nav__link inline-flex items-center gap-1" aria-haspopup="menu">
        {item.label}
        <span aria-hidden className="text-[10px]">▾</span>
      </button>
      <div className="invisible absolute left-0 top-full z-40 min-w-[10rem] pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        <ul role="menu" className="rounded-lg border border-[var(--line)] bg-[var(--panel)] py-1 shadow-md">
          {item.children.map((child) => (
            <li key={child.slug} role="none">
              <Link role="menuitem" href={child.href} className="block px-3 py-2 text-sm text-[var(--field)] hover:bg-[var(--wash)]">
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function BrandMark({
  branding,
  brandMark,
  href,
}: {
  branding: ResolvedStorefrontBranding;
  brandMark: BrandMarkMode;
  href: string;
}) {
  const hasLogo = Boolean(branding.logoUrl);
  const showLogo =
    hasLogo && (brandMark === "logo-and-name" || brandMark === "logo-only");
  const showName =
    brandMark === "name-only" ||
    brandMark === "logo-and-name" ||
    (!hasLogo && brandMark === "logo-only");

  return (
    <Link href={href} className="flex min-w-0 items-center gap-3" onClick={(e) => e.stopPropagation()}>
      {showLogo && branding.logoUrl ? (
        <Image
          src={branding.logoUrl}
          alt={showName ? "" : branding.headline}
          width={120}
          height={48}
          className="h-9 w-auto max-w-[140px] object-contain"
        />
      ) : null}
      {showName ? (
        <span className="studio-nav__brand truncate">{branding.headline}</span>
      ) : null}
    </Link>
  );
}

function buildNavItems(input: {
  enabledPages: StorefrontPageId[];
  storefrontSlug: string;
  draft?: boolean;
  basePath?: string;
  templateId: StudioTemplateId;
  hasMenus?: boolean;
  customNavPages: StudioNavItem[];
}): StudioNavItem[] {
  const items: StudioNavItem[] = [];
  const { enabledPages, storefrontSlug, draft, basePath, templateId, hasMenus, customNavPages } =
    input;
  if (enabledPages.includes("home")) {
    items.push({ slug: "home", label: "Home", href: shopHomePath(storefrontSlug, draft, basePath) });
  }
  if (enabledPages.includes("shop")) {
    items.push({
      slug: "shop",
      label: SHOP_LABEL[templateId],
      href: shopPagePath(storefrontSlug, "shop", draft, basePath),
    });
  }
  if (hasMenus) {
    items.push({ slug: "menu", label: "Menus", href: shopMenusPath(storefrontSlug, draft, basePath) });
  }
  if (customNavPages.length > 0) {
    items.push(...customNavPages);
  } else {
    if (enabledPages.includes("about")) {
      items.push({
        slug: "about",
        label: templateId === "farmhouse" ? "Our farm" : "About",
        href: shopPagePath(storefrontSlug, "about", draft, basePath),
      });
    }
    if (enabledPages.includes("contact")) {
      items.push({
        slug: "contact",
        label: "Contact",
        href: shopPagePath(storefrontSlug, "contact", draft, basePath),
      });
    }
  }
  return items;
}

function MobileNavList({
  navItems,
  activePage,
  onNavigate,
}: {
  navItems: StudioNavItem[];
  activePage: string;
  onNavigate: () => void;
}) {
  return (
    <ul className="flex flex-col gap-2">
      {navItems.map((item) => (
        <li key={item.slug}>
          {item.children?.length ? (
            <div className="py-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                {item.label}
              </p>
              <ul className="mt-1 flex flex-col">
                {item.children.map((child) => (
                  <li key={child.slug}>
                    <Link
                      href={child.href}
                      className="block py-2 text-sm font-semibold text-[var(--field)]"
                      onClick={onNavigate}
                    >
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <Link
              href={item.href}
              className={`block py-2 text-sm font-semibold text-[var(--field)] ${
                activePage === item.slug ? "underline" : ""
              }`}
              onClick={onNavigate}
            >
              {item.label}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function StudioStorefrontNav({
  storefrontSlug,
  standSlug,
  branding,
  activePage,
  enabledPages,
  draft,
  basePath,
  templateId,
  hasMenus,
  customNavPages = [],
  editable,
  selected,
  onSelect,
  headerLayout: layoutOverride,
  brandMark: markOverride,
}: {
  storefrontSlug: string;
  standSlug: string;
  branding: ResolvedStorefrontBranding;
  activePage: StorefrontPageId | "product" | "menu" | string;
  enabledPages: StorefrontPageId[];
  draft?: boolean;
  basePath?: string;
  templateId: StudioTemplateId;
  hasMenus?: boolean;
  customNavPages?: StudioNavItem[];
  editable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  headerLayout?: HeaderLayout;
  brandMark?: BrandMarkMode;
}) {
  const [open, setOpen] = useState(false);
  const template = resolveStudioTemplate(templateId, "FOOD_BUSINESS");
  const headerLayout = layoutOverride ?? branding.headerLayout;
  const brandMark = markOverride ?? branding.brandMark;
  const subscribe = useCallback(
    (onStoreChange: () => void) => subscribeStandCart(onStoreChange),
    [],
  );
  const getSnapshot = useCallback(() => {
    void getStandCartEpoch();
    return cartItemCount(readStandCartLines(standSlug));
  }, [standSlug]);
  const cartCount = useSyncExternalStore(subscribe, getSnapshot, () => 0);

  const navItems = buildNavItems({
    enabledPages,
    storefrontSlug,
    draft,
    basePath,
    templateId,
    hasMenus,
    customNavPages,
  });

  const navClass =
    template.headerVariant === "editorial"
      ? "studio-nav studio-nav--artisan"
      : template.headerVariant === "farm-gate"
        ? "studio-nav studio-nav--farmhouse"
        : "studio-nav studio-nav--market";

  const homeHref = shopHomePath(storefrontSlug, draft, basePath);
  const brand = <BrandMark branding={branding} brandMark={brandMark} href={homeHref} />;
  const desktopNav =
    headerLayout === "minimal" ? null : (
      <nav className="hidden items-center gap-6 md:flex" aria-label="Main" onClick={(e) => e.stopPropagation()}>
        {navItems.map((item) => (
          <NavDropdown key={item.slug} item={item} />
        ))}
      </nav>
    );
  const actions = (
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      {cartCount > 0 ? (
        <Link href={standCartPath(standSlug)} className="studio-btn studio-btn--secondary text-sm">
          Cart ({cartCount})
        </Link>
      ) : null}
      <button
        type="button"
        className="studio-nav__menu-btn md:hidden"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        Menu
      </button>
    </div>
  );

  let body: ReactNode;
  if (headerLayout === "centred") {
    body = (
      <div className="mx-auto grid max-w-[var(--studio-content-max)] grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-3 sm:px-8 sm:py-4">
        <div className="hidden justify-self-start md:block">{desktopNav}</div>
        <div className="col-start-2 justify-self-center">{brand}</div>
        <div className="justify-self-end">{actions}</div>
      </div>
    );
  } else if (headerLayout === "stacked") {
    body = (
      <div className="mx-auto flex max-w-[var(--studio-content-max)] flex-col gap-2 px-4 py-3 sm:px-8 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          {brand}
          {actions}
        </div>
        <div className="flex justify-center border-t border-[var(--line)] pt-2">{desktopNav}</div>
      </div>
    );
  } else if (headerLayout === "minimal") {
    body = (
      <div className="mx-auto flex max-w-[var(--studio-content-max)] items-center justify-between gap-4 px-4 py-2.5 sm:px-8">
        {brand}
        {actions}
      </div>
    );
  } else {
    body = (
      <div className="mx-auto flex max-w-[var(--studio-content-max)] items-center justify-between gap-4 px-4 py-3 sm:px-8 sm:py-4">
        {brand}
        {templateId === "farmhouse" && branding.regionLabel ? (
          <p className="hidden text-sm text-[var(--muted)] lg:block">{branding.regionLabel}</p>
        ) : null}
        {desktopNav}
        {actions}
      </div>
    );
  }

  return (
    <header
      className={`${navClass} sticky top-0 z-30 border-b border-[var(--line)] bg-[var(--panel)]/95 backdrop-blur ${
        selected ? "ring-2 ring-inset ring-[var(--leaf)]" : ""
      } ${editable ? "cursor-pointer" : ""}`}
      onClick={
        editable
          ? (e) => {
              e.stopPropagation();
              onSelect?.();
            }
          : undefined
      }
      role={editable ? "button" : undefined}
      tabIndex={editable ? 0 : undefined}
      onKeyDown={
        editable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect?.();
              }
            }
          : undefined
      }
      aria-label={editable ? "Edit header style" : undefined}
    >
      {body}
      {open ? (
        <nav className="border-t border-[var(--line)] px-4 py-3 md:hidden" aria-label="Mobile">
          <MobileNavList
            navItems={navItems}
            activePage={activePage}
            onNavigate={() => setOpen(false)}
          />
        </nav>
      ) : null}
    </header>
  );
}
```


### `src/components/craft/sections/CraftHeroSection.tsx`


```tsx src/components/craft/sections/CraftHeroSection.tsx
"use client";

import { useNode } from "@craftjs/core";
import PuckHeroBlock from "@/components/puck/blocks/PuckHeroBlock";
import StudioHeroBlock from "@/components/studio/blocks/StudioHeroBlock";
import CraftSectionChrome from "../CraftSectionChrome";
import { useCraftMetadata } from "../CraftEditorContext";
import type { StudioMetadata } from "@/lib/studio/types";

export type CraftHeroProps = {
  headline: string;
  supportingText: string;
  layout: string;
  ctaLabel: string;
  showCta: boolean;
  decorativeImageUrl?: string;
  imageUrl?: string;
};

function isStudioMetadata(meta: unknown): meta is StudioMetadata {
  return Boolean(meta && typeof meta === "object" && "templateId" in meta);
}

export default function CraftHeroSection(props: CraftHeroProps) {
  const { connectors: { connect, drag } } = useNode();
  const metadata = useCraftMetadata();
  const backgroundImageUrl = props.decorativeImageUrl || props.imageUrl || null;

  return (
    <div ref={(dom) => { if (dom) connect(drag(dom)); }}>
      <CraftSectionChrome>
        {isStudioMetadata(metadata) ? (
          <StudioHeroBlock
            headline={props.headline}
            supportingText={props.supportingText}
            layout={props.layout as import("@/lib/studio/preset-registry").HeroPreset}
            ctaLabel={props.ctaLabel}
            showCta={props.showCta}
            backgroundImageUrl={backgroundImageUrl}
            metadata={metadata}
            isEditing
            editable
          />
        ) : (
          <PuckHeroBlock
            headline={props.headline}
            supportingText={props.supportingText}
            ctaLabel={props.ctaLabel}
            showCta={props.showCta}
            layout={
              props.layout === "editorial" || props.layout === "minimal"
                ? "simple"
                : (props.layout as "simple" | "split" | "spotlight" | "background")
            }
            puck={{ metadata }}
          />
        )}
      </CraftSectionChrome>
    </div>
  );
}

CraftHeroSection.craft = {
  displayName: "CraftHeroSection",
  props: {
    headline: "",
    supportingText: "",
    layout: "background",
    ctaLabel: "Shop now",
    showCta: true,
  },
  rules: { canDrag: () => true, canMoveIn: () => false },
};
```


### `src/components/studio/blocks/StudioHeroBlock.tsx`


```tsx src/components/studio/blocks/StudioHeroBlock.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import type { StudioMetadata } from "@/lib/studio/types";
import { shopPagePath } from "@/lib/storefront/paths";
import type { HeroPreset } from "@/lib/studio/preset-registry";
import InlineEditableText from "@/components/studio/InlineEditableText";

type Props = {
  headline: string;
  supportingText: string;
  layout: HeroPreset | "simple" | "split" | "spotlight" | "background" | "editorial" | "minimal";
  ctaLabel: string;
  showCta: boolean;
  metadata: StudioMetadata;
  isEditing?: boolean;
  editable?: boolean;
  /** Optional section-level image (e.g. AI decorative placeholder). */
  backgroundImageUrl?: string | null;
};

type ResolvedVariant =
  | "editorial"
  | "split"
  | "background"
  | "minimal"
  | "farm-landscape"
  | "stand-status"
  | "produce-split"
  | "shop-first"
  | "current-menu"
  | "product-collage"
  | "promo";

function resolveVariant(templateId: StudioMetadata["templateId"], layout: Props["layout"]): ResolvedVariant {
  if (layout === "farm-landscape" || layout === "stand-status" || layout === "produce-split") return layout;
  if (layout === "shop-first" || layout === "current-menu" || layout === "product-collage" || layout === "promo") {
    return layout;
  }
  if (layout === "simple" || layout === "spotlight") {
    return templateId === "market" ? "shop-first" : templateId === "farmhouse" ? "stand-status" : "editorial";
  }
  if (layout === "split" || layout === "background" || layout === "minimal" || layout === "editorial") {
    return layout;
  }
  if (templateId === "farmhouse") return "farm-landscape";
  if (templateId === "market") return "shop-first";
  return "background";
}

function HeroTitle({
  editable,
  value,
  display,
  className,
  placeholder,
}: {
  editable?: boolean;
  value: string;
  display: string;
  className: string;
  placeholder?: string;
}) {
  if (editable) {
    return (
      <InlineEditableText
        prop="headline"
        value={value}
        as="h1"
        className={className}
        placeholder={placeholder || "Add a headline"}
      />
    );
  }
  return <h1 className={className}>{display}</h1>;
}

function HeroSubtitle({
  editable,
  value,
  display,
  className,
}: {
  editable?: boolean;
  value: string;
  display: string;
  className: string;
}) {
  if (editable) {
    return (
      <InlineEditableText
        prop="supportingText"
        value={value}
        as="p"
        className={className}
        multiline
        placeholder="Add supporting text"
      />
    );
  }
  if (!display) return null;
  return <p className={className}>{display}</p>;
}

export default function StudioHeroBlock({
  headline,
  supportingText,
  layout,
  ctaLabel,
  showCta,
  metadata: meta,
  backgroundImageUrl,
  editable = false,
}: Props) {
  const variant = resolveVariant(meta.templateId, layout);
  const title = headline.trim() || meta.branding.headline;
  const subtitle = supportingText.trim() || meta.branding.subheadline || "";
  const heroImage = backgroundImageUrl || meta.branding.heroImageUrl;
  const shopHref = shopPagePath(meta.storefrontSlug, "shop", meta.draft, meta.basePath);
  const showButton = showCta && meta.products.length > 0;
  const templateClass = `studio-hero--${variant}`;
  const brandHeadline = meta.branding.headline || "Add a headline";

  const cta = showButton ? (
    <Link href={shopHref} className="studio-btn studio-btn--primary">
      {ctaLabel || (meta.templateId === "market" ? "Shop now" : "Browse")}
    </Link>
  ) : null;

  if (variant === "shop-first" || variant === "promo") {
    return (
      <section className={`studio-hero ${templateClass} border-b border-[var(--line)] bg-[var(--panel)]`}>
        <div className="mx-auto flex max-w-[var(--studio-content-max)] flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-12">
          <div className="max-w-xl">
            {variant === "promo" ? (
              <p className="studio-eyebrow text-[var(--leaf-dark)]">This week</p>
            ) : null}
            <HeroTitle
              editable={editable}
              value={headline}
              display={title}
              className="studio-display text-3xl text-[var(--field)] sm:text-4xl"
              placeholder={brandHeadline}
            />
            <HeroSubtitle
              editable={editable}
              value={supportingText}
              display={subtitle}
              className="mt-3 text-base text-[var(--muted)] sm:text-lg"
            />
          </div>
          {cta ? <div className="shrink-0">{cta}</div> : null}
        </div>
      </section>
    );
  }

  if (variant === "current-menu") {
    const menu = meta.menus[0];
    return (
      <section className={`studio-hero ${templateClass} border-b border-[var(--line)] bg-[var(--wash)]`}>
        <div className="mx-auto max-w-[var(--studio-content-max)] px-4 py-10 sm:px-8 sm:py-12">
          <p className="studio-eyebrow text-[var(--leaf-dark)]">Current menu</p>
          {editable ? (
            <>
              <HeroTitle
                editable
                value={headline}
                display={title}
                className="studio-display mt-2 text-3xl text-[var(--field)] sm:text-4xl"
                placeholder={menu?.title || brandHeadline}
              />
              <HeroSubtitle
                editable
                value={supportingText}
                display={subtitle}
                className="mt-3 max-w-2xl text-[var(--muted)]"
              />
            </>
          ) : (
            <>
              <h1 className="studio-display mt-2 text-3xl text-[var(--field)] sm:text-4xl">
                {menu?.title ?? title}
              </h1>
              {menu?.description ? (
                <p className="mt-3 max-w-2xl text-[var(--muted)]">{menu.description}</p>
              ) : subtitle ? (
                <p className="mt-3 max-w-2xl text-[var(--muted)]">{subtitle}</p>
              ) : null}
            </>
          )}
          {cta ? <div className="mt-6">{cta}</div> : null}
        </div>
      </section>
    );
  }

  if (variant === "product-collage" && meta.products.length > 0) {
    const collage = meta.products.slice(0, 4);
    return (
      <section className={`studio-hero ${templateClass} border-b border-[var(--line)] bg-[var(--panel)]`}>
        <div className="mx-auto grid max-w-[var(--studio-content-max)] gap-8 px-4 py-10 lg:grid-cols-2 lg:items-center sm:px-8">
          <div>
            <HeroTitle
              editable={editable}
              value={headline}
              display={title}
              className="studio-display text-3xl text-[var(--field)] sm:text-4xl"
              placeholder={brandHeadline}
            />
            <HeroSubtitle
              editable={editable}
              value={supportingText}
              display={subtitle}
              className="mt-3 text-[var(--muted)]"
            />
            {cta ? <div className="mt-6">{cta}</div> : null}
          </div>
          <ul className="grid grid-cols-2 gap-3">
            {collage.map((p) => (
              <li key={p.id} className="relative aspect-square overflow-hidden rounded-[var(--studio-card-radius)] bg-[var(--wash)]">
                {p.imageUrl ? (
                  <Image src={p.imageUrl} alt={p.name} fill className="object-cover" sizes="25vw" />
                ) : (
                  <span className="flex h-full items-end p-3 text-sm font-medium text-[var(--muted)]">{p.name}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  if (variant === "stand-status") {
    return (
      <section className={`studio-hero ${templateClass} border-b border-[var(--line)] bg-[var(--wash)]`}>
        <div className="mx-auto max-w-[var(--studio-content-max)] px-4 py-12 sm:px-8 sm:py-16">
          {meta.branding.regionLabel ? (
            <p className="studio-eyebrow text-[var(--site-accent,#a0522d)]">{meta.branding.regionLabel}</p>
          ) : null}
          <HeroTitle
            editable={editable}
            value={headline}
            display={title}
            className="studio-display mt-2 text-4xl text-[var(--field)] sm:text-5xl"
            placeholder={brandHeadline}
          />
          <HeroSubtitle
            editable={editable}
            value={supportingText}
            display={subtitle}
            className="mt-4 max-w-2xl text-lg text-[var(--muted)]"
          />
          <div className="mt-6 inline-flex flex-wrap gap-3">
            <span className="rounded-md border border-[var(--line)] bg-[var(--panel)] px-3 py-1.5 text-sm font-semibold text-[var(--field)]">
              Farm stand open
            </span>
            {cta ? cta : null}
          </div>
        </div>
      </section>
    );
  }

  if ((variant === "background" || variant === "farm-landscape") && heroImage) {
    return (
      <section className={`studio-hero ${templateClass} relative min-h-[var(--studio-hero-min-height-mobile)] overflow-hidden sm:min-h-[var(--studio-hero-min-height)]`}>
        <Image src={heroImage} alt="" fill priority className="object-cover" sizes="100vw" />
        <div className={`studio-hero__overlay absolute inset-0 ${
          variant === "farm-landscape"
            ? "bg-gradient-to-t from-[#1f2e1f]/75 via-[#1f2e1f]/40 to-transparent"
            : "bg-gradient-to-t from-black/70 via-black/45 to-black/25"
        }`} />
        <div className="relative mx-auto flex min-h-[inherit] max-w-[var(--studio-content-max)] items-end px-4 py-14 sm:px-8 sm:py-20">
          <div className="max-w-xl text-white">
            {meta.branding.regionLabel ? (
              <p className="studio-eyebrow mb-3 text-white/80">{meta.branding.regionLabel}</p>
            ) : null}
            <HeroTitle
              editable={editable}
              value={headline}
              display={title}
              className="studio-display text-4xl sm:text-5xl lg:text-6xl"
              placeholder={brandHeadline}
            />
            <HeroSubtitle
              editable={editable}
              value={supportingText}
              display={subtitle}
              className="mt-4 text-lg leading-relaxed text-white/90 sm:text-xl"
            />
            {cta ? <div className="mt-8">{cta}</div> : null}
          </div>
        </div>
      </section>
    );
  }

  if (variant === "split" || variant === "produce-split") {
    return (
      <section className={`studio-hero ${templateClass} border-b border-[var(--line)] bg-[var(--panel)]`}>
        <div className="mx-auto grid max-w-[var(--studio-content-max)] lg:grid-cols-2">
          <div className="flex flex-col justify-center px-4 py-12 sm:px-8 sm:py-16 lg:py-20">
            {meta.branding.regionLabel ? (
              <p className="studio-eyebrow text-[var(--leaf-dark)]">{meta.branding.regionLabel}</p>
            ) : null}
            <HeroTitle
              editable={editable}
              value={headline}
              display={title}
              className="studio-display mt-2 text-4xl text-[var(--field)] sm:text-5xl"
              placeholder={brandHeadline}
            />
            <HeroSubtitle
              editable={editable}
              value={supportingText}
              display={subtitle}
              className="mt-4 text-lg leading-relaxed text-[var(--muted)]"
            />
            {cta ? <div className="mt-8">{cta}</div> : null}
          </div>
          <div className="relative aspect-[4/3] bg-[var(--wash)] lg:aspect-auto lg:min-h-[28rem]">
            {heroImage ? (
              <Image src={heroImage} alt="" fill className="object-cover" sizes="(max-width:1024px) 100vw, 50vw" priority />
            ) : (
              <div className="flex h-full items-center justify-center p-8 text-center text-sm text-[var(--muted)]">
                Add a hero image in branding settings
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (variant === "minimal" || !heroImage) {
    return (
      <section className={`studio-hero ${templateClass} border-b border-[var(--line)] bg-[var(--wash)]`}>
        <div className="mx-auto max-w-[var(--studio-prose-max)] px-4 py-16 text-center sm:px-6 sm:py-20">
          {meta.branding.regionLabel ? (
            <p className="studio-eyebrow text-[var(--leaf-dark)]">{meta.branding.regionLabel}</p>
          ) : null}
          <HeroTitle
            editable={editable}
            value={headline}
            display={title}
            className="studio-display mt-2 text-4xl text-[var(--field)] sm:text-5xl"
            placeholder={brandHeadline}
          />
          <HeroSubtitle
            editable={editable}
            value={supportingText}
            display={subtitle}
            className="mt-5 text-lg leading-relaxed text-[var(--muted)]"
          />
          {cta ? <div className="mt-8 flex justify-center">{cta}</div> : null}
        </div>
      </section>
    );
  }

  return (
    <section className={`studio-hero ${templateClass} border-b border-[var(--line)] bg-[var(--panel)]`}>
      <div className="mx-auto max-w-[var(--studio-content-max)] px-4 py-10 sm:px-8 sm:py-14">
        <div className="relative aspect-[16/9] overflow-hidden rounded-[var(--studio-card-radius)]">
          <Image src={heroImage} alt="" fill className="object-cover" sizes="100vw" priority />
        </div>
        <div className="mx-auto mt-10 max-w-[var(--studio-prose-max)] text-center">
          {meta.branding.regionLabel ? (
            <p className="studio-eyebrow text-[var(--leaf-dark)]">{meta.branding.regionLabel}</p>
          ) : null}
          <HeroTitle
            editable={editable}
            value={headline}
            display={title}
            className="studio-display mt-2 text-4xl text-[var(--field)] sm:text-5xl"
            placeholder={brandHeadline}
          />
          <HeroSubtitle
            editable={editable}
            value={supportingText}
            display={subtitle}
            className="mt-4 text-lg leading-relaxed text-[var(--muted)]"
          />
          {cta ? <div className="mt-8 flex justify-center">{cta}</div> : null}
        </div>
      </div>
    </section>
  );
}
```


### `src/components/craft/sections/CraftProductGridSection.tsx`


```tsx src/components/craft/sections/CraftProductGridSection.tsx
"use client";

import { useNode } from "@craftjs/core";
import PuckFeaturedProductsBlock from "@/components/puck/blocks/PuckFeaturedProductsBlock";
import StudioProductsBlock from "@/components/studio/blocks/StudioProductsBlock";
import CraftSectionChrome from "../CraftSectionChrome";
import { useCraftMetadata } from "../CraftEditorContext";
import type { StudioMetadata } from "@/lib/studio/types";
import type { ProductPreset } from "@/lib/studio/preset-registry";

export type CraftProductGridProps = {
  source: "all" | "category" | "manual" | "activeCategory";
  categoryId: string;
  productIds: string[];
  limit: number;
  layout: "grid" | "list";
  columns: 2 | 3 | 4;
  preset: ProductPreset;
  heading: string;
  showPrice: boolean;
  showAvailability: boolean;
};

function isStudioMetadata(meta: unknown): meta is StudioMetadata {
  return Boolean(meta && typeof meta === "object" && "templateId" in meta);
}

export default function CraftProductGridSection(props: CraftProductGridProps) {
  const { connectors: { connect, drag } } = useNode();
  const metadata = useCraftMetadata();

  return (
    <div ref={(dom) => { if (dom) connect(drag(dom)); }}>
      <CraftSectionChrome>
        {isStudioMetadata(metadata) ? (
          <StudioProductsBlock
            source={props.source}
            categoryId={props.categoryId}
            productIds={props.productIds}
            limit={props.limit}
            preset={props.preset}
            columns={props.columns}
            heading={props.heading}
            showPrice={props.showPrice}
            showAvailability={props.showAvailability}
            metadata={metadata}
            isEditing
            editable
          />
        ) : (
          <PuckFeaturedProductsBlock
            source={props.source === "activeCategory" ? "all" : props.source}
            categoryId={props.categoryId}
            productIds={props.productIds}
            limit={props.limit}
            layout={props.layout}
            columns={props.columns}
            showPrice={props.showPrice}
            showAvailability={props.showAvailability}
            puck={{ metadata, isEditing: true }}
          />
        )}
      </CraftSectionChrome>
    </div>
  );
}

CraftProductGridSection.craft = {
  displayName: "CraftProductGridSection",
  props: {
    source: "all",
    categoryId: "",
    productIds: [] as string[],
    limit: 8,
    layout: "grid",
    columns: 3,
    preset: "editorial",
    heading: "Our bakes",
    showPrice: true,
    showAvailability: true,
  },
  rules: { canDrag: () => true, canMoveIn: () => false },
};
```


### `src/components/studio/blocks/StudioProductsBlock.tsx`


```tsx src/components/studio/blocks/StudioProductsBlock.tsx
import Image from "next/image";
import Link from "next/link";
import type { StudioMetadata } from "@/lib/studio/types";
import { formatMoney } from "@/lib/public-product";
import { shopProductPath } from "@/lib/storefront/paths";
import type { ProductPreset as ExtendedProductPreset } from "@/lib/studio/preset-registry";
import { mapProductPreset } from "@/lib/studio/preset-registry";
import StudioSectionHeading from "@/components/studio/StudioSectionHeading";

type Props = {
  source: "all" | "category" | "manual" | "activeCategory";
  categoryId: string;
  productIds: string[];
  limit: number;
  preset: ExtendedProductPreset | "editorial" | "classic" | "featured" | "compact";
  columns: 2 | 3 | 4;
  heading: string;
  showPrice: boolean;
  showAvailability: boolean;
  metadata: StudioMetadata;
  isEditing?: boolean;
  editable?: boolean;
};

export default function StudioProductsBlock({
  source,
  categoryId,
  productIds,
  limit,
  preset,
  columns,
  heading,
  showPrice,
  showAvailability,
  metadata: meta,
  isEditing,
  editable = false,
}: Props) {
  const mappedPreset = mapProductPreset(meta.templateId, preset);
  const isDense = meta.templateId === "market" || preset === "dense" || preset === "list";
  const isFarm = meta.templateId === "farmhouse" || preset === "farm-grid" || preset === "availability";

  let pool = meta.products;
  if (source === "manual" && productIds.length > 0) {
    pool = productIds
      .map((id) => meta.products.find((p) => p.id === id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));
  } else if (source === "activeCategory") {
    const catId = meta.commerceContext?.category?.id ?? categoryId;
    pool = catId
      ? meta.products.filter((p) => p.categoryIds.includes(catId))
      : meta.products;
  } else if (source === "category" && categoryId) {
    pool = meta.products.filter((p) => p.categoryIds.includes(categoryId));
  }

  const displayHeading =
    !editable &&
    source === "activeCategory" &&
    meta.commerceContext?.category?.title
      ? meta.commerceContext.category.title
      : heading;

  const products = pool.slice(0, Math.max(1, Math.min(limit, 12)));
  const title = (
    <StudioSectionHeading
      editable={editable}
      value={heading}
      fallback={displayHeading || "Our bakes"}
      placeholder="Product section heading"
    />
  );

  if (products.length === 0) {
    if (!isEditing) return null;
    return (
      <section className="studio-section">
        <div className="studio-section__inner">
          {title}
          <p className="mt-3 text-[var(--muted)]">Add products to show them here.</p>
          <Link href="/dashboard/products/new" className="studio-btn studio-btn--secondary mt-4">
            Add product
          </Link>
        </div>
      </section>
    );
  }

  const colClass =
    mappedPreset === "compact" || isDense
      ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      : mappedPreset === "featured"
        ? "grid-cols-1 sm:grid-cols-2"
        : columns === 4 || isDense
          ? "grid-cols-2 lg:grid-cols-4"
          : columns === 3
            ? "grid-cols-2 lg:grid-cols-3"
            : "grid-cols-2";

  const sectionClass = isFarm ? "studio-section studio-section--wash" : "studio-section";
  const cardPreset = mappedPreset;

  return (
    <section className={sectionClass}>
      <div className="studio-section__inner">
        {title}
        <ul className={`mt-8 grid ${isDense ? "gap-3" : "gap-5"} ${colClass}`}>
          {products.map((product) => (
            <li key={product.id}>
              <ProductCard
                product={product}
                meta={meta}
                preset={cardPreset}
                showPrice={showPrice}
                showAvailability={showAvailability}
                isFarm={isFarm}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ProductCard({
  product,
  meta,
  preset,
  showPrice,
  showAvailability,
  isFarm,
}: {
  product: StudioMetadata["products"][number];
  meta: StudioMetadata;
  preset: "editorial" | "classic" | "featured" | "compact";
  showPrice: boolean;
  showAvailability: boolean;
  isFarm?: boolean;
}) {
  const href = shopProductPath(meta.storefrontSlug, product.slug, meta.draft, meta.basePath);
  const aspect = preset === "editorial" || preset === "featured" ? "aspect-[4/5]" : "aspect-square";
  const cardClass =
    preset === "editorial"
      ? "studio-product-card studio-product-card--editorial"
      : isFarm
        ? "studio-product-card studio-product-card--farm"
        : "studio-product-card";

  return (
    <Link href={href} className={`group block ${cardClass}`}>
      <div className={`relative overflow-hidden rounded-[var(--studio-card-radius)] bg-[var(--wash)] ${aspect}`}>
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
            sizes="(max-width:768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-end bg-gradient-to-br from-[var(--wash)] to-[var(--line)] p-4">
            <span className="studio-product-card__fallback text-sm font-medium text-[var(--muted)]">
              {product.name}
            </span>
          </div>
        )}
        {showAvailability && product.soldOut ? (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-[var(--gone)]">
            Sold out
          </span>
        ) : null}
      </div>
      <div className={preset === "featured" ? "mt-4 sm:flex sm:items-end sm:justify-between sm:gap-4" : "mt-3"}>
        <p className="font-semibold leading-snug text-[var(--field)] group-hover:text-[var(--leaf-dark)]">
          {product.name}
        </p>
        {showPrice ? (
          <p className="mt-1 text-sm text-[var(--muted)] sm:mt-0">
            {formatMoney(product.priceCents, meta.currency)}
          </p>
        ) : null}
        {showAvailability && product.soldOut && product.label ? (
          <p className="mt-1 text-xs text-[var(--muted)]">{product.label}</p>
        ) : null}
      </div>
    </Link>
  );
}
```


### `src/components/studio/sections/CraftCategoriesSection.tsx`


```tsx src/components/studio/sections/CraftCategoriesSection.tsx
"use client";

import { useNode } from "@craftjs/core";
import CraftSectionChrome from "@/components/craft/CraftSectionChrome";
import StudioCategoriesBlock from "@/components/studio/blocks/StudioCategoriesBlock";
import { useStudioMetadata } from "@/components/studio/StudioEditorContext";
import type { CategoryPreset } from "@/lib/studio/preset-registry";

export type CraftCategoriesProps = {
  source: "all" | "selected";
  categoryIds: string[];
  preset: CategoryPreset;
  heading: string;
  /** @deprecated use preset */
  layout?: CategoryPreset;
};

export default function CraftCategoriesSection(props: CraftCategoriesProps) {
  const { connectors: { connect, drag } } = useNode();
  const metadata = useStudioMetadata();
  const preset = props.preset ?? props.layout ?? "tiles";

  return (
    <div ref={(dom) => { if (dom) connect(drag(dom)); }}>
      <CraftSectionChrome>
        <StudioCategoriesBlock
          source={props.source}
          categoryIds={props.categoryIds}
          preset={preset}
          heading={props.heading}
          metadata={metadata}
          isEditing
          editable
        />
      </CraftSectionChrome>
    </div>
  );
}

CraftCategoriesSection.craft = {
  displayName: "CraftCategoriesSection",
  props: {
    source: "all",
    categoryIds: [] as string[],
    preset: "tiles",
    heading: "Browse categories",
  },
  rules: { canDrag: () => true, canMoveIn: () => false },
};
```


### `src/components/studio/blocks/StudioCategoriesBlock.tsx`


```tsx src/components/studio/blocks/StudioCategoriesBlock.tsx
import Image from "next/image";
import Link from "next/link";
import type { PuckSpikeMetadata } from "@/lib/puck/types";
import { shopCategoryPath } from "@/lib/storefront/paths";
import type { CategoryPreset } from "@/lib/studio/preset-registry";
import { mapCategoryPreset } from "@/lib/studio/preset-registry";
import StudioSectionHeading from "@/components/studio/StudioSectionHeading";

export default function StudioCategoriesBlock({
  source,
  categoryIds,
  preset,
  heading,
  metadata,
  isEditing,
  editable = false,
}: {
  source: "all" | "selected";
  categoryIds: string[];
  preset: CategoryPreset;
  heading: string;
  metadata: PuckSpikeMetadata;
  isEditing?: boolean;
  editable?: boolean;
}) {
  let categories = metadata.categories;
  if (source === "selected" && categoryIds.length > 0) {
    categories = categories.filter((c) => categoryIds.includes(c.id));
  }

  const title = (
    <StudioSectionHeading
      editable={editable}
      value={heading}
      fallback="Browse categories"
      placeholder="Categories heading"
    />
  );

  if (categories.length === 0) {
    if (!isEditing) return null;
    return (
      <section className="studio-section">
        <div className="studio-section__inner">
          {title}
          <p className="mt-3 text-sm text-[var(--muted)]">Add categories to show them here.</p>
        </div>
      </section>
    );
  }

  const mappedPreset = mapCategoryPreset(
    "templateId" in metadata ? (metadata as import("@/lib/studio/types").StudioMetadata).templateId : "artisan",
    preset,
  );

  const gridClass =
    mappedPreset === "compact" || mappedPreset === "minimal"
      ? "flex flex-wrap gap-2"
      : mappedPreset === "cards"
        ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        : "grid grid-cols-2 gap-4 sm:grid-cols-3";

  return (
    <section className="studio-section">
      <div className="studio-section__inner">
        {title}
        <ul className={`mt-8 ${gridClass}`}>
          {categories.map((cat) => (
            <li key={cat.id}>
              <CategoryTile cat={cat} preset={mappedPreset} metadata={metadata} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CategoryTile({
  cat,
  preset,
  metadata,
}: {
  cat: PuckSpikeMetadata["categories"][number];
  preset: "tiles" | "cards" | "compact" | "minimal";
  metadata: PuckSpikeMetadata;
}) {
  const href = shopCategoryPath(
    metadata.storefrontSlug,
    cat.slug,
    metadata.draft,
    metadata.basePath,
  );
  const imageUrl = cat.imageUrl;

  if (preset === "compact" || preset === "minimal") {
    return (
      <Link
        href={href}
        className="inline-flex rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--field)] hover:border-[var(--leaf-dark)]"
      >
        {cat.title}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-[var(--studio-card-radius)] border border-[var(--line)] bg-white"
    >
      <div className="relative aspect-[4/3] bg-[var(--wash)]">
        {imageUrl ? (
          <Image src={imageUrl} alt="" fill className="object-cover" sizes="33vw" />
        ) : (
          <div className="flex h-full items-end p-4">
            <span className="text-sm font-medium text-[var(--muted)]">{cat.title}</span>
          </div>
        )}
      </div>
      {imageUrl ? (
        <p className="p-3 font-semibold text-[var(--field)] group-hover:text-[var(--leaf-dark)]">
          {cat.title}
        </p>
      ) : null}
    </Link>
  );
}
```


### `src/components/studio/shell/StudioStorefrontFooter.tsx`


```tsx src/components/studio/shell/StudioStorefrontFooter.tsx
import Link from "next/link";
import type { ResolvedStorefrontBranding } from "@/lib/storefront/types";
import type { StorefrontPageId } from "@/lib/storefront/types";
import { shopHomePath, shopPagePath } from "@/lib/storefront/paths";
import type { StudioTemplateId } from "@/lib/studio/types";
import { resolveStudioTemplate } from "@/lib/studio/templates";
import { isWebsiteDemoStorefrontSlug } from "@/lib/demo";
import type { FooterColumnId } from "@/lib/studio/custom-pages";
import { FOOTER_COLUMNS } from "@/lib/studio/custom-pages";

type FooterLink = { label: string; href: string; column?: FooterColumnId };

export default function StudioStorefrontFooter({
  branding,
  storefrontSlug,
  enabledPages,
  draft,
  basePath,
  templateId,
  customFooterPages = [],
}: {
  branding: ResolvedStorefrontBranding;
  storefrontSlug: string;
  enabledPages: StorefrontPageId[];
  draft?: boolean;
  basePath?: string;
  templateId: StudioTemplateId;
  customFooterPages?: FooterLink[];
}) {
  const isDemoStore = isWebsiteDemoStorefrontSlug(storefrontSlug);
  const template = resolveStudioTemplate(templateId, "FOOD_BUSINESS");

  const fallbackLinks: FooterLink[] = [];
  if (enabledPages.includes("shop")) {
    fallbackLinks.push({
      label: "Shop All",
      href: shopPagePath(storefrontSlug, "shop", draft, basePath),
      column: "shop",
    });
  }
  if (enabledPages.includes("about")) {
    fallbackLinks.push({
      label: templateId === "farmhouse" ? "Our farm" : "About",
      href: shopPagePath(storefrontSlug, "about", draft, basePath),
      column: "visit",
    });
  }
  if (enabledPages.includes("contact")) {
    fallbackLinks.push({
      label: "Contact",
      href: shopPagePath(storefrontSlug, "contact", draft, basePath),
      column: "visit",
    });
  }

  const links: FooterLink[] =
    customFooterPages.length > 0 ? customFooterPages : fallbackLinks;

  const byColumn = (col: FooterColumnId) =>
    links.filter((l) => (l.column ?? "visit") === col);

  const shopLinks = [
    {
      label: "Shop All",
      href: shopPagePath(storefrontSlug, "shop", draft, basePath),
    },
    ...byColumn("shop"),
  ];
  // Dedupe Shop All if already in custom list
  const shopSeen = new Set<string>();
  const shopUnique = shopLinks.filter((l) => {
    if (shopSeen.has(l.href)) return false;
    shopSeen.add(l.href);
    return true;
  });

  const footerClass =
    template.footerVariant === "editorial-dark"
      ? "studio-footer studio-footer--artisan-dark"
      : template.footerVariant === "farm-location"
        ? "studio-footer studio-footer--farmhouse"
        : "studio-footer studio-footer--market";

  return (
    <footer className={footerClass}>
      <div className="mx-auto max-w-[var(--studio-content-max)] px-4 py-12 sm:px-8 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="studio-footer__brand">{branding.businessName}</p>
            {branding.subheadline ? (
              <p className="mt-2 max-w-xs text-sm leading-relaxed opacity-80">
                {branding.subheadline}
              </p>
            ) : null}
            {branding.regionLabel ? (
              <p className="mt-3 text-sm opacity-75">{branding.regionLabel}</p>
            ) : null}
            <p className="mt-4">
              <a
                href={`mailto:${branding.contactEmail}`}
                className="text-sm font-medium hover:underline"
              >
                {branding.contactEmail}
              </a>
            </p>
          </div>

          {FOOTER_COLUMNS.map((col) => {
            const colLinks =
              col.id === "shop"
                ? shopUnique
                : byColumn(col.id);
            if (colLinks.length === 0) return null;
            return (
              <div key={col.id}>
                <p className="text-xs font-bold uppercase tracking-wide opacity-60">
                  {col.label}
                </p>
                <ul className="mt-3 space-y-2">
                  {colLinks.map((l) => (
                    <li key={`${col.id}-${l.href}`}>
                      <Link
                        href={l.href}
                        className="text-sm font-medium hover:underline"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        <p className="mt-10 border-t border-current/15 pt-6 text-xs opacity-70">
          © {new Date().getFullYear()} {branding.businessName}
          {" · "}
          <Link
            href={shopHomePath(storefrontSlug, draft, basePath)}
            className="hover:underline"
          >
            Home
          </Link>
          {isDemoStore
            ? " — Green Valley Farm & Bakes is a fictional store created to demonstrate Vendl."
            : null}
        </p>
      </div>
    </footer>
  );
}
```


---

*End of reference pack. Update this file when studio tokens, section registry, or blueprint kits change.*
