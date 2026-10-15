import { resolveButtonLink, type LinkContext } from "./button-link";
import type { StudioNavItem } from "./navigation";

export type HeaderMenuChild = { id: string; label: string; link: string };
export type HeaderMenuItem = { id: string; label: string; link?: string; children?: HeaderMenuChild[] };
export type HeaderMenu = { items: HeaderMenuItem[] };

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
