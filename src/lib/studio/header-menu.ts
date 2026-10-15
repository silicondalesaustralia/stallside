import { z } from "zod";
import { buttonLinkSchema } from "./button-link-schema";
import type { StudioNavItem } from "./navigation";
import type { HeaderMenu } from "./header-menu-view";

export * from "./header-menu-view";

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
export const headerMenuSchema = z.object({
  items: z.array(item).max(HEADER_MENU_MAX_ITEMS),
}) satisfies z.ZodType<HeaderMenu>;

export function parseHeaderMenu(config: unknown): HeaderMenu | null {
  if (!config || typeof config !== "object" || Array.isArray(config)) return null;
  const parsed = headerMenuSchema.safeParse((config as Record<string, unknown>).headerMenu);
  return parsed.success ? parsed.data : null;
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
