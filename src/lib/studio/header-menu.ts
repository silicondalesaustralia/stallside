import { z } from "zod";
import { buttonLinkSchema, resolveButtonLink, type LinkContext } from "./button-link";
import type { StudioNavItem } from "./navigation";

/**
 * The seller's own header menu, stored as `draftConfig.headerMenu`. Missing = the automatic
 * menu (Home, Shop, Menus, then pages from Navigation). Links use button-link tokens so they
 * resolve correctly for the draft and the live site.
 */
export const HEADER_MENU_MAX_ITEMS = 12;
export const HEADER_MENU_MAX_CHILDREN = 10;
export const HEADER_MENU_LABEL_MAX = 40;

const id = z.string().min(1).max(40);
const label = z.string().trim().min(1, "Every link needs text.").max(HEADER_MENU_LABEL_MAX);
const child = z.object({ id, label, link: buttonLinkSchema });
const item = z.object({
  id,
  label,
  link: buttonLinkSchema.optional(),
  children: z.array(child).max(HEADER_MENU_MAX_CHILDREN).optional(),
});
export const headerMenuSchema = z.object({ items: z.array(item).max(HEADER_MENU_MAX_ITEMS) });

export type HeaderMenu = z.infer<typeof headerMenuSchema>;
export type HeaderMenuItem = z.infer<typeof item>;
export type HeaderMenuChild = z.infer<typeof child>;

export function parseHeaderMenu(config: unknown): HeaderMenu | null {
  if (!config || typeof config !== "object" || Array.isArray(config)) return null;
  const parsed = headerMenuSchema.safeParse((config as Record<string, unknown>).headerMenu);
  return parsed.success ? parsed.data : null;
}

/** Header links for display. Links whose page no longer exists are dropped. */
export function resolveHeaderMenu(menu: HeaderMenu, ctx: LinkContext): StudioNavItem[] {
  return menu.items.flatMap((entry) => {
    const children = (entry.children ?? []).flatMap((c) => {
      const href = resolveButtonLink(c.link, ctx);
      return href ? [{ slug: c.id, label: c.label, href }] : [];
    });
    const href = resolveButtonLink(entry.link, ctx) ?? children[0]?.href;
    if (!href) return [];
    return [{ slug: entry.id, label: entry.label, href, ...(children.length ? { children } : {}) }];
  });
}

const PAGE_TOKENS: Record<string, string> = {
  home: "page:home",
  shop: "page:shop",
  menu: "page:menu",
  about: "page:about",
  contact: "page:contact",
  blog: "page:blog",
};

function tokenFor(slug: string): string {
  return PAGE_TOKENS[slug] ?? `nav:${slug}`;
}

export function newMenuId(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** A starting menu that matches what the header shows today, so customising loses nothing. */
export function seedHeaderMenu(autoItems: StudioNavItem[]): HeaderMenu {
  return {
    items: autoItems.slice(0, HEADER_MENU_MAX_ITEMS).map((nav) => ({
      id: newMenuId(),
      label: nav.label.slice(0, HEADER_MENU_LABEL_MAX),
      ...(nav.children?.length
        ? {
            children: nav.children.slice(0, HEADER_MENU_MAX_CHILDREN).map((c) => ({
              id: newMenuId(),
              label: c.label.slice(0, HEADER_MENU_LABEL_MAX),
              link: tokenFor(c.slug),
            })),
          }
        : { link: tokenFor(nav.slug) }),
    })),
  };
}

/** The first problem that would stop the menu saving, in seller words; null when valid. */
export function headerMenuProblem(menu: HeaderMenu): string | null {
  const parsed = headerMenuSchema.safeParse(menu);
  if (parsed.success) {
    const empty = menu.items.find((i) => !i.link && !i.children?.length);
    return empty ? `“${empty.label}” needs a link or dropdown links.` : null;
  }
  const issue = parsed.error.issues[0];
  if (issue?.path.includes("label")) return "Every link needs text (up to 40 characters).";
  if (issue?.path.includes("link")) return "One of the links isn't a page, product or valid web address.";
  return "The menu couldn't be saved. Check each link.";
}
