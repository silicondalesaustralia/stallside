import { z } from "zod";
import { safeHref } from "@/lib/website/rich-text/parse";
import { shopHomePath, shopMenusPath, shopPagePath, shopProductPath } from "@/lib/storefront/paths";

/**
 * Where a section's button goes. Stored as a token so it resolves to the right URL in the
 * editor (draft) and on the live site:
 *   page:<home|shop|about|contact|menu|blog>  nav:<custom page slug>  product:<slug>
 *   or a web address, email (mailto:) or phone (tel:) accepted by `safeHref`.
 * Empty / missing means the section's default (usually the shop).
 */
export const BUTTON_PAGES = ["home", "shop", "about", "contact", "menu", "blog"] as const;
export type ButtonPage = (typeof BUTTON_PAGES)[number];

/** Sections whose main button is a link the seller can change. */
export const LINKABLE_BUTTON_SECTIONS = new Set(["CraftHeroSection", "CraftImageTextSection", "CraftFarmStandSection"]);

const TOKEN = /^(page:(home|shop|about|contact|menu|blog)|nav:[\w-]{1,120}|product:[\w-]{1,160})$/;

export function isButtonLink(value: unknown): value is string {
  return typeof value === "string" && value.length <= 500 && (TOKEN.test(value) || safeHref(value) !== null);
}

export const buttonLinkSchema = z.string().refine(isButtonLink, "Pick a page, product or a valid web address.");

export type LinkContext = {
  storefrontSlug: string;
  draft?: boolean;
  basePath?: string;
  /** Every enabled custom page, whether or not it's in the automatic menu. */
  linkablePages?: { slug: string; href: string }[];
  customNavPages?: { slug: string; href: string; children?: { slug: string; href: string }[] }[];
};

/** The URL for a stored button link, or null to use the section's default. */
export function resolveButtonLink(link: unknown, ctx: LinkContext): string | null {
  if (!isButtonLink(link)) return null;
  const { storefrontSlug: slug, draft, basePath } = ctx;
  if (link.startsWith("page:")) {
    const page = link.slice(5) as ButtonPage;
    if (page === "home") return shopHomePath(slug, draft, basePath);
    if (page === "menu") return shopMenusPath(slug, draft, basePath);
    return shopPagePath(slug, page, draft, basePath);
  }
  if (link.startsWith("product:")) return shopProductPath(slug, link.slice(8), draft, basePath);
  if (link.startsWith("nav:")) {
    const target = link.slice(4);
    const items = [
      ...(ctx.linkablePages ?? []),
      ...(ctx.customNavPages ?? []).flatMap((item) => [item, ...(item.children ?? [])]),
    ];
    return items.find((item) => item.slug === target)?.href ?? null;
  }
  return safeHref(link);
}

export function isExternalLink(href: string): boolean {
  return /^https?:\/\//i.test(href);
}
