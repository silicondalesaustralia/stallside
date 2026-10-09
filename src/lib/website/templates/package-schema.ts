import { z } from "zod";
import { BUSINESS_MODES } from "@/lib/business-mode";
import { WEBSITE_LIMITS as L } from "@/lib/website/schema/limits";
import type { VendlSectionType } from "@/lib/website/sections/types";

/** Sections a template may place. Product/menu detail pages keep the built-in layout. */
export const TEMPLATE_SECTION_TYPES = [
  "hero",
  "productGrid",
  "categories",
  "nextDrop",
  "text",
  "image",
  "imageText",
  "about",
  "reviews",
  "pickup",
  "signup",
  "farmStand",
] as const satisfies readonly VendlSectionType[];

export type TemplateSectionType = (typeof TEMPLATE_SECTION_TYPES)[number];

const propValue = z.union([
  z.string().max(L.bodyChars),
  z.number(),
  z.boolean(),
  z.array(z.string().max(L.idChars)).max(L.productIdsPerSection),
]);

export const templateSlotSchema = z.strictObject({
  /** Stable id within the page; becomes part of the section id. */
  slot: z.string().regex(/^[a-z][a-z0-9-]{0,40}$/),
  type: z.enum(TEMPLATE_SECTION_TYPES),
  variant: z.string().max(L.labelChars).optional(),
  /** Flat section props. Strings may use {{business.*}} tokens. */
  props: z.record(z.string(), propValue).optional(),
  /** Only placed for these business modes (registry rules still apply). */
  businessModes: z.array(z.enum(BUSINESS_MODES)).min(1).optional(),
});

const slots = z.array(templateSlotSchema).max(L.sectionsPerPage);

export const templatePackageSchema = z.strictObject({
  schemaVersion: z.literal(1),
  id: z.string().regex(/^[a-z][a-z0-9-]{1,40}$/),
  version: z.number().int().min(1),
  name: z.string().min(1).max(L.labelChars),
  summary: z.string().min(1).max(L.shortTextChars),
  bestFor: z.string().min(1).max(L.shortTextChars),
  /** Only the skin is set; colours, fonts and logo stay the seller's. */
  skin: z.enum(["artisan", "farmhouse", "market"]),
  businessModes: z.array(z.enum(BUSINESS_MODES)).min(1),
  pages: z.strictObject({
    home: slots.min(1),
    shop: slots.optional(),
  }),
});

export type TemplateSlot = z.infer<typeof templateSlotSchema>;
export type TemplatePackage = z.infer<typeof templatePackageSchema>;
export type TemplatePageId = keyof TemplatePackage["pages"];

/** Studio page keys each template page writes to. */
export const TEMPLATE_PAGE_KEYS: Record<TemplatePageId, string> = {
  home: "home",
  shop: "commerce-shop",
};
