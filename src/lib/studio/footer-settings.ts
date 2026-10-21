import { z } from "zod";
import { buttonLinkSchema } from "./button-link-schema";
import { isColourValue } from "@/lib/website/sections/section-style";
import { mediaUrl } from "@/lib/website/sections/fields";
import {
  FOOTER_ADDRESS_MAX,
  FOOTER_BOTTOM_MAX,
  FOOTER_BRAND_MAX,
  FOOTER_HEADING_MAX,
  FOOTER_LABEL_MAX,
  FOOTER_LOGO_SIZES,
  FOOTER_MAX_COLUMNS,
  FOOTER_MAX_LINKS,
  FOOTER_MOBILE_LAYOUTS,
  FOOTER_TAGLINE_MAX,
  type FooterSettings,
} from "./footer-view";

export * from "./footer-view";

/**
 * The seller's footer, stored as `draftConfig.footer`. Missing = the automatic footer.
 * Missing `columns` = automatic link columns (Shop / Visit & Learn / Policies from page settings).
 * `bottomText` replaces "© {year} {business}"; `{year}` is filled in when shown.
 */
const id = z.string().min(1).max(40);
const colour = z.string().refine(isColourValue);
const footerLink = z.object({
  id,
  label: z.string().trim().min(1, "Every link needs text.").max(FOOTER_LABEL_MAX),
  link: buttonLinkSchema,
});
const footerContact = z.object({
  address: z.string().max(FOOTER_ADDRESS_MAX).optional(),
  phone: z.string().max(40).optional(),
  email: z.string().max(120).optional(),
  hours: z.string().max(FOOTER_ADDRESS_MAX).optional(),
});
const footerColumn = z.object({
  id,
  heading: z.string().max(FOOTER_HEADING_MAX),
  links: z.array(footerLink).max(FOOTER_MAX_LINKS),
  contact: footerContact.optional(),
});

export const footerSettingsSchema = z.object({
  brandName: z.string().max(FOOTER_BRAND_MAX).optional(),
  tagline: z.string().max(FOOTER_TAGLINE_MAX).optional(),
  showBrand: z.boolean().optional(),
  showLogo: z.boolean().optional(),
  logoUrl: mediaUrl.optional(),
  logoSize: z.enum(FOOTER_LOGO_SIZES).optional(),
  showTagline: z.boolean().optional(),
  showRegion: z.boolean().optional(),
  showEmail: z.boolean().optional(),
  showPhone: z.boolean().optional(),
  showSocial: z.boolean().optional(),
  columns: z.array(footerColumn).max(FOOTER_MAX_COLUMNS).optional(),
  bottomText: z.string().max(FOOTER_BOTTOM_MAX).optional(),
  showHomeLink: z.boolean().optional(),
  mobileLayout: z.enum(FOOTER_MOBILE_LAYOUTS).optional(),
  background: colour.optional(),
  textColour: colour.optional(),
}) satisfies z.ZodType<FooterSettings>;

export function parseFooterSettings(config: unknown): FooterSettings | null {
  if (!config || typeof config !== "object" || Array.isArray(config)) return null;
  const parsed = footerSettingsSchema.safeParse((config as Record<string, unknown>).footer);
  return parsed.success ? parsed.data : null;
}

/** The first problem that would stop the footer saving, in seller words; null when fine. */
export function footerSettingsProblem(footer: unknown): string | null {
  const parsed = footerSettingsSchema.safeParse(footer);
  if (parsed.success) return null;
  const issue = parsed.error.issues[0];
  if (issue?.path.includes("label")) return `Every footer link needs text (up to ${FOOTER_LABEL_MAX} characters).`;
  if (issue?.path.includes("link")) return "One of the footer links isn't a page, product or valid web address.";
  if (issue?.path.includes("heading")) return `Column headings can be up to ${FOOTER_HEADING_MAX} characters.`;
  return "The footer couldn't be saved. Check the text and links.";
}
