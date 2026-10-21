import { z } from "zod";
import { BODY_SIZES, HEADING_SIZES, colourValue } from "@/lib/website/sections/section-style";
import { siteFont } from "./site-fonts";

export const CONTENT_WIDTHS = ["narrow", "standard", "wide", "full"] as const;
export const SECTION_SPACINGS = ["compact", "standard", "roomy", "spacious"] as const;
export const SIDE_MARGINS = ["tight", "standard", "wide", "extra"] as const;
export const CORNERS = ["square", "soft", "rounded", "round"] as const;
export const BUTTON_SHAPES = ["square", "rounded", "pill"] as const;
export const SITE_BUTTON_SIZES = ["sm", "md", "lg"] as const;
export const HEADING_WEIGHTS = ["400", "500", "600", "700", "800"] as const;
export const HEADING_CASES = ["normal", "upper"] as const;
export const HEADING_TRACKINGS = ["tight", "normal", "wide"] as const;
export const HEADER_SCROLLS = ["sticky", "scroll"] as const;
export const PRODUCT_RATIOS = ["square", "portrait", "landscape"] as const;
export const CARD_HOVERS = ["none", "lift", "zoom"] as const;
export const SECTION_ANIMATIONS = ["none", "fade"] as const;
export const SECTION_DIVIDERS = ["none", "line", "alternate"] as const;
export const CART_BUTTON_STYLES = ["outline", "filled", "text"] as const;
export const SHOP_PARTS = ["count", "category", "price", "stock", "sale", "rating"] as const;
export type ShopPart = (typeof SHOP_PARTS)[number];

/** Badge text is rendered through CSS `content`, so quotes and backslashes are not allowed. */
const SALE_BADGE_TEXT = /^[\p{L}\p{N} !%&+\-.,:/$€£¥]+$/u;

export type ContentWidth = (typeof CONTENT_WIDTHS)[number];
export type SectionSpacing = (typeof SECTION_SPACINGS)[number];

const font = z.string().max(64).refine((id) => Boolean(siteFont(id)), "Pick a font from the list.");

/**
 * Site-wide look (theme override `siteStyle`). Every field is optional: unset = template default.
 * Sections keep their own colour, size and button settings, which win over these.
 */
export const siteStyleSchema = z.object({
  headingFont: font.optional(),
  bodyFont: font.optional(),
  headingColour: colourValue.optional(),
  textColour: colourValue.optional(),
  headingSize: z.enum(HEADING_SIZES).optional(),
  bodySize: z.enum(BODY_SIZES).optional(),
  headingWeight: z.enum(HEADING_WEIGHTS).optional(),
  headingCase: z.enum(HEADING_CASES).optional(),
  headingTracking: z.enum(HEADING_TRACKINGS).optional(),
  contentWidth: z.enum(CONTENT_WIDTHS).optional(),
  sectionSpacing: z.enum(SECTION_SPACINGS).optional(),
  sideMargins: z.enum(SIDE_MARGINS).optional(),
  corners: z.enum(CORNERS).optional(),
  buttonShape: z.enum(BUTTON_SHAPES).optional(),
  buttonSize: z.enum(SITE_BUTTON_SIZES).optional(),
  headerScroll: z.enum(HEADER_SCROLLS).optional(),
  /** Header bar colours; text is picked for the background when only that is set. */
  headerBackground: colourValue.optional(),
  headerText: colourValue.optional(),
  /** Header dropdown menus; unset follows the header bar. */
  dropdownBackground: colourValue.optional(),
  dropdownText: colourValue.optional(),
  dropdownHoverBackground: colourValue.optional(),
  dropdownHoverText: colourValue.optional(),
  productRatio: z.enum(PRODUCT_RATIOS).optional(),
  cardHover: z.enum(CARD_HOVERS).optional(),
  animation: z.enum(SECTION_ANIMATIONS).optional(),
  dividers: z.enum(SECTION_DIVIDERS).optional(),
  /** The large "View cart" bar at the bottom of shop pages; shown unless set to false. */
  cartBarDesktop: z.boolean().optional(),
  cartBarMobile: z.boolean().optional(),
  /** "Sale" badge next to prices of on-sale products; shown unless set to false. */
  saleBadge: z.boolean().optional(),
  saleBadgeText: z.string().trim().min(1).max(16).regex(SALE_BADGE_TEXT, "Letters, numbers and simple punctuation only.").optional(),
  saleBadgeBackground: colourValue.optional(),
  saleBadgeColour: colourValue.optional(),
  saleBadgeShape: z.enum(BUTTON_SHAPES).optional(),
  /** Sort menu and filter sidebar on shop and category pages; shown unless set to false. */
  shopSort: z.boolean().optional(),
  shopFilters: z.boolean().optional(),
  /** Individual parts of the shop / category browser that are switched off. */
  shopHidden: z.array(z.enum(SHOP_PARTS)).max(SHOP_PARTS.length).optional(),
  /** Header cart button; unset = the template's outlined button reading "Cart (n)". */
  cartButtonStyle: z.enum(CART_BUTTON_STYLES).optional(),
  cartButtonLabel: z.string().trim().min(1).max(20).optional(),
  cartButtonIcon: z.boolean().optional(),
  /** Item count after the label; shown unless set to false. */
  cartButtonCount: z.boolean().optional(),
  /** Show the button even while the cart is empty. */
  cartButtonAlways: z.boolean().optional(),
  cartButtonBackground: colourValue.optional(),
  cartButtonColour: colourValue.optional(),
  cartButtonShape: z.enum(BUTTON_SHAPES).optional(),
});

export type SiteStyle = z.infer<typeof siteStyleSchema>;
type SiteStyleKey = keyof SiteStyle;

/** Reads a saved `siteStyle`; invalid fields are dropped so a bad value can't break the site. */
export function parseSiteStyle(raw: unknown): SiteStyle {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const obj = raw as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(siteStyleSchema.shape) as SiteStyleKey[]) {
    const parsed = siteStyleSchema.shape[key].safeParse(obj[key]);
    if (parsed.success && parsed.data !== undefined) out[key] = parsed.data;
  }
  return out as SiteStyle;
}
