import type { StorefrontPageId } from "@/lib/storefront/types";
import { resolveButtonLink, type LinkContext } from "./button-link";
import { FOOTER_COLUMNS, type FooterColumnId } from "./custom-pages";
import { FOOTER_LABEL_MAX, FOOTER_MAX_LINKS, type FooterColumn } from "./footer-settings";

export type ResolvedFooterColumn = {
  id: string;
  heading: string;
  links: { id: string; label: string; href: string }[];
};

type AutoLink = { label: string; link: string; column: FooterColumnId };

/**
 * The footer columns shown when the seller hasn't customised them: pages marked "show in
 * footer" grouped by their column (or Shop All / About / Contact), with Shop All first under Shop.
 */
export function autoFooterColumns(input: {
  enabledPages: StorefrontPageId[];
  footerPages: { slug: string; label: string; column: FooterColumnId }[];
  aboutLabel?: string;
}): FooterColumn[] {
  const { enabledPages, footerPages } = input;
  const pages: AutoLink[] = footerPages.length
    ? footerPages.map((p) => ({ label: p.label, link: `nav:${p.slug}`, column: p.column }))
    : [
        ...(enabledPages.includes("about")
          ? [{ label: input.aboutLabel ?? "About", link: "page:about", column: "visit" as const }]
          : []),
        ...(enabledPages.includes("contact") ? [{ label: "Contact", link: "page:contact", column: "visit" as const }] : []),
      ];

  return FOOTER_COLUMNS.flatMap((col) => {
    const seen = new Set<string>();
    const links = [
      ...(col.id === "shop" ? [{ label: "Shop All", link: "page:shop" }] : []),
      ...pages.filter((p) => p.column === col.id),
    ]
      .filter((l) => (seen.has(l.link) ? false : (seen.add(l.link), true)))
      .slice(0, FOOTER_MAX_LINKS)
      .map((l, i) => ({ id: `${col.id}-${i}`, label: l.label.slice(0, FOOTER_LABEL_MAX), link: l.link }));
    return links.length ? [{ id: col.id, heading: col.label, links }] : [];
  });
}

/** Columns ready to show. Links whose page no longer exists are dropped, then empty columns. */
export function resolveFooterColumns(columns: FooterColumn[], ctx: LinkContext): ResolvedFooterColumn[] {
  return columns.flatMap((col) => {
    const links = col.links.flatMap((l) => {
      const href = resolveButtonLink(l.link, ctx);
      return href ? [{ id: l.id, label: l.label, href }] : [];
    });
    return links.length ? [{ id: col.id, heading: col.heading, links }] : [];
  });
}
