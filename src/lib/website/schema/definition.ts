import { z } from "zod";
import { WEBSITE_LIMITS as L, WEBSITE_SCHEMA_VERSION } from "./limits";
import { ALL_PAGE_KINDS, entityId, heading, label, mediaUrl } from "@/lib/website/sections/fields";

const looseRecord = z.record(z.string(), z.unknown());

export const sectionVisibility = z.enum(["public", "hidden", "editorOnly"]);

export const sectionInstanceSchema = z.object({
  id: entityId,
  type: z.string().min(1).max(L.labelChars),
  schemaVersion: z.number().int().positive(),
  variant: z.string().min(1).max(L.labelChars),
  visibility: sectionVisibility,
  content: looseRecord,
  settings: looseRecord,
  binding: looseRecord.optional(),
  /** Legacy props the registry doesn't model yet; preserved, never dropped. */
  extras: looseRecord.optional(),
  /** Editor-only markers (placeholder kind, AI provenance). Never rendered. */
  editorMeta: looseRecord.optional(),
});

export const pageSchema = z.object({
  id: entityId,
  kind: z.enum(ALL_PAGE_KINDS as [string, ...string[]]),
  slug: z.string().max(L.labelChars),
  title: z.string().max(L.headingChars),
  enabled: z.boolean(),
  /** "legacy" pages have no section layout yet and use the built-in page renderer. */
  layoutSource: z.enum(["sections", "legacy"]),
  seo: looseRecord.optional(),
  sections: z.array(sectionInstanceSchema).max(L.sectionsPerPage),
});

export const navItemSchema = z.object({ pageId: entityId, label });

export const footerColumnSchema = z.object({
  column: z.enum(["shop", "visit", "policies"]),
  items: z.array(navItemSchema).max(L.pages),
});

const optionalText = z.string().max(L.shortTextChars).nullable().optional();

export const identitySchema = z.object({
  headline: heading.nullable().optional(),
  subheadline: optionalText,
  about: z.string().max(L.bodyChars).nullable().optional(),
  heroImageUrl: mediaUrl.nullable().optional(),
  faviconUrl: mediaUrl.nullable().optional(),
  logoUrl: mediaUrl.nullable().optional(),
  contactEmail: optionalText,
  showPhone: z.boolean().optional(),
});

export const themeSchema = z.object({
  skin: z.enum(["artisan", "farmhouse", "market"]),
  accentColor: z.string().max(32).optional(),
  secondaryColor: z.string().max(32).optional(),
  buttonStyle: z.enum(["pill", "rounded"]).optional(),
  paletteId: z.string().max(L.labelChars).optional(),
  fontPairId: z.string().max(L.labelChars).optional(),
  headerLayout: z.string().max(L.labelChars).optional(),
  brandMark: z.string().max(L.labelChars).optional(),
});

export const websiteDefinitionSchema = z.object({
  schemaVersion: z.literal(WEBSITE_SCHEMA_VERSION),
  template: z.object({ id: z.string().min(1).max(L.labelChars), version: z.number().int().min(0) }),
  theme: themeSchema,
  identity: identitySchema,
  navigation: z.object({
    header: z.array(navItemSchema).max(L.pages),
    footer: z.array(footerColumnSchema).max(3),
  }),
  pages: z.record(entityId, pageSchema),
});

export type SectionInstance = z.infer<typeof sectionInstanceSchema>;
export type WebsitePage = z.infer<typeof pageSchema>;
export type WebsiteDefinition = z.infer<typeof websiteDefinitionSchema>;
export type WebsiteTheme = z.infer<typeof themeSchema>;
