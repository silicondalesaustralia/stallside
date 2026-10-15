import { z } from "zod";
import { WEBSITE_LIMITS as L } from "@/lib/website/schema/limits";
import { parseBlockLayout, type ProductBlockLayout } from "./product-blocks";

export const PRODUCT_LAYOUTS = ["featured", "classic", "gallery", "simple"] as const;
/** Featured layout: share of the row the main photo takes on wider screens (percent). */
export const IMAGE_SIZE_MIN = 35;
export const IMAGE_SIZE_MAX = 75;
export const IMAGE_SIZE_DEFAULT = 60;
export const PRODUCT_IMAGE_RATIOS = ["square", "portrait", "landscape"] as const;
export const PRODUCT_IMAGE_SIDES = ["left", "right"] as const;
export const INFO_ROW_ICONS = ["pickup", "delivery", "secure", "fresh", "local", "info"] as const;

export type ProductLayout = (typeof PRODUCT_LAYOUTS)[number];
export type ProductImageRatio = (typeof PRODUCT_IMAGE_RATIOS)[number];
export type InfoRowIcon = (typeof INFO_ROW_ICONS)[number];

export const INFO_ROWS_MAX = 6;
export const INFO_ROW_TEXT_MAX = 120;
export const PRODUCT_TABS_MAX = 8;
export const PRODUCT_TAB_TITLE_MAX = 80;

const infoRowSchema = z.object({
  id: z.string().min(1).max(L.idChars),
  icon: z.enum(INFO_ROW_ICONS),
  text: z.string().max(INFO_ROW_TEXT_MAX),
});
const productTabSchema = z.object({
  id: z.string().min(1).max(L.idChars),
  title: z.string().max(PRODUCT_TAB_TITLE_MAX),
  body: z.string().max(L.bodyChars),
});

export const infoRowsSchema = z.array(infoRowSchema).max(INFO_ROWS_MAX);
export const productTabsSchema = z.array(productTabSchema).max(PRODUCT_TABS_MAX);

export type InfoRow = z.infer<typeof infoRowSchema>;
export type ProductTab = z.infer<typeof productTabSchema>;

/** Starter rows for a newly added product page; sellers edit or remove them. */
export const DEFAULT_INFO_ROWS: InfoRow[] = [
  { id: "row-pickup", icon: "pickup", text: "Pickup or delivery options shown at checkout" },
  { id: "row-secure", icon: "secure", text: "Secure checkout" },
];

export type ProductDetailView = {
  layout: ProductLayout;
  imageRatio: ProductImageRatio;
  imageOnRight: boolean;
  /** Featured layout only: main photo width in percent. */
  imageSize: number;
  enlarge: boolean;
  stickyCart: boolean;
  /** Payment marks under the cart buttons; off unless the seller turns it on. */
  showPayments: boolean;
  infoRows: InfoRow[];
  tabs: ProductTab[];
  /** Which zone each block sits in, in order. */
  blocks: ProductBlockLayout;
};

/** Saved rows for editing, including blank ones; none when malformed. */
export function parseInfoRows(value: unknown): InfoRow[] {
  const parsed = infoRowsSchema.safeParse(value);
  return parsed.success ? parsed.data : [];
}

export function parseProductTabs(value: unknown): ProductTab[] {
  const parsed = productTabsSchema.safeParse(value);
  return parsed.success ? parsed.data : [];
}

function imageSizeOf(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return IMAGE_SIZE_DEFAULT;
  return Math.min(IMAGE_SIZE_MAX, Math.max(IMAGE_SIZE_MIN, Math.round(value)));
}

function pick<T extends string>(options: readonly T[], value: unknown, fallback: T): T {
  return options.includes(value as T) ? (value as T) : fallback;
}

/**
 * Display settings from saved section props. Sections saved before layouts existed have no
 * `layout`, so they keep the original single-column look ("simple").
 */
export function productDetailView(props: Record<string, unknown>): ProductDetailView {
  return {
    layout: pick(PRODUCT_LAYOUTS, props.layout, "simple"),
    imageRatio: pick(PRODUCT_IMAGE_RATIOS, props.imageRatio, "square"),
    imageOnRight: props.imageSide === "right",
    imageSize: imageSizeOf(props.imageSize),
    enlarge: props.enlarge !== false,
    stickyCart: props.stickyCart !== false,
    showPayments: props.showPayments === true,
    infoRows: parseInfoRows(props.infoRows).filter((r) => r.text.trim()),
    tabs: parseProductTabs(props.tabs).filter((t) => t.title.trim()),
    blocks: parseBlockLayout(props.blockLayout),
  };
}

export const RATIO_CLASS: Record<ProductImageRatio, string> = {
  square: "aspect-square",
  portrait: "aspect-[4/5]",
  landscape: "aspect-[4/3]",
};
