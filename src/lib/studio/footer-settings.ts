import { z } from "zod";
import { buttonLinkSchema } from "./button-link";
import { isColourValue } from "@/lib/website/sections/section-style";
import { colourCss, resolvedTextColour, type ThemePalette } from "@/lib/website/sections/colour";

/**
 * The seller's footer, stored as `draftConfig.footer`. Missing = the automatic footer.
 * Missing `columns` = automatic link columns (Shop / Visit & Learn / Policies from page settings).
 * `bottomText` replaces "© {year} {business}"; `{year}` is filled in when shown.
 */
export const FOOTER_MAX_COLUMNS = 4;
export const FOOTER_MAX_LINKS = 10;
export const FOOTER_HEADING_MAX = 40;
export const FOOTER_LABEL_MAX = 60;
export const FOOTER_BRAND_MAX = 80;
export const FOOTER_TAGLINE_MAX = 240;
export const FOOTER_BOTTOM_MAX = 200;

const id = z.string().min(1).max(40);
const colour = z.string().refine(isColourValue);
const footerLink = z.object({
  id,
  label: z.string().trim().min(1, "Every link needs text.").max(FOOTER_LABEL_MAX),
  link: buttonLinkSchema,
});
const footerColumn = z.object({
  id,
  heading: z.string().max(FOOTER_HEADING_MAX),
  links: z.array(footerLink).max(FOOTER_MAX_LINKS),
});

export const footerSettingsSchema = z.object({
  brandName: z.string().max(FOOTER_BRAND_MAX).optional(),
  tagline: z.string().max(FOOTER_TAGLINE_MAX).optional(),
  showBrand: z.boolean().optional(),
  showTagline: z.boolean().optional(),
  showRegion: z.boolean().optional(),
  showEmail: z.boolean().optional(),
  showPhone: z.boolean().optional(),
  columns: z.array(footerColumn).max(FOOTER_MAX_COLUMNS).optional(),
  bottomText: z.string().max(FOOTER_BOTTOM_MAX).optional(),
  showHomeLink: z.boolean().optional(),
  background: colour.optional(),
  textColour: colour.optional(),
});

export type FooterSettings = z.infer<typeof footerSettingsSchema>;
export type FooterColumn = z.infer<typeof footerColumn>;
export type FooterLink = z.infer<typeof footerLink>;

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

/** The line at the bottom of the footer, without the Home link. */
export function footerBottomLine(footer: FooterSettings | null, businessName: string, year: number): string {
  const custom = footer?.bottomText?.trim();
  if (custom) return custom.replaceAll("{year}", String(year));
  return `© ${year} ${businessName}`;
}

/** Inline colours when the seller picked them; otherwise the template's footer colours apply. */
export function footerColours(
  footer: FooterSettings | null,
  palette: ThemePalette,
): { background?: string; color?: string } | undefined {
  if (!footer?.background && !footer?.textColour) return undefined;
  const text =
    footer.textColour ?? (footer.background ? resolvedTextColour({ background: footer.background }, palette) : null);
  return {
    ...(footer.background ? { background: colourCss(footer.background) } : {}),
    ...(text ? { color: colourCss(text) } : {}),
  };
}
