import { colourCss, resolvedTextColour, type ThemePalette } from "@/lib/website/sections/colour";

export const FOOTER_MAX_COLUMNS = 4;
export const FOOTER_MAX_LINKS = 10;
export const FOOTER_HEADING_MAX = 40;
export const FOOTER_LABEL_MAX = 60;
export const FOOTER_BRAND_MAX = 80;
export const FOOTER_TAGLINE_MAX = 240;
export const FOOTER_BOTTOM_MAX = 200;
export const FOOTER_ADDRESS_MAX = 300;
/** How link columns sit on phones: one under another, collapsed behind their headings, or two across. */
export const FOOTER_MOBILE_LAYOUTS = ["stacked", "accordion", "columns"] as const;
export type FooterMobileLayout = (typeof FOOTER_MOBILE_LAYOUTS)[number];

export type FooterLink = { id: string; label: string; link: string };
/** Free-typed contact details shown in a column, above its links. */
export type FooterContact = { address?: string; phone?: string; email?: string; hours?: string };
export type FooterColumn = { id: string; heading: string; links: FooterLink[]; contact?: FooterContact };

export const FOOTER_LOGO_SIZES = ["sm", "md", "lg"] as const;
export type FooterLogoSize = (typeof FOOTER_LOGO_SIZES)[number];

export type FooterSettings = {
  brandName?: string;
  tagline?: string;
  showBrand?: boolean;
  /** Show a logo above the business name: `logoUrl`, else the site logo. */
  showLogo?: boolean;
  logoUrl?: string;
  logoSize?: FooterLogoSize;
  showTagline?: boolean;
  showRegion?: boolean;
  showEmail?: boolean;
  showPhone?: boolean;
  showSocial?: boolean;
  columns?: FooterColumn[];
  bottomText?: string;
  showHomeLink?: boolean;
  mobileLayout?: FooterMobileLayout;
  background?: string;
  textColour?: string;
};

/** Whether a contact block has anything to show. */
export function hasFooterContact(contact: FooterContact | undefined): contact is FooterContact {
  return Boolean(contact && Object.values(contact).some((v) => v?.trim()));
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
