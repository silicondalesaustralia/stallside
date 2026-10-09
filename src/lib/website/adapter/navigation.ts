import {
  FOOTER_COLUMNS,
  resolveFooterColumn,
  type StorefrontCustomPage,
} from "@/lib/studio/custom-pages";
import type { WebsiteDefinition } from "@/lib/website/schema/definition";

type Navigation = WebsiteDefinition["navigation"];

const bySortOrder = (a: StorefrontCustomPage, b: StorefrontCustomPage) => a.sortOrder - b.sortOrder;

/**
 * Header and footer as independent ordered lists. Legacy pages share one
 * sortOrder, so both start in that order; the definition stores them apart.
 */
export function navigationFromPages(pages: StorefrontCustomPage[]): Navigation {
  const live = pages.filter((p) => p.enabled).sort(bySortOrder);
  return {
    header: live
      .filter((p) => p.showInNav)
      .map((p) => ({ pageId: p.id, label: p.navLabel || p.title })),
    footer: FOOTER_COLUMNS.map(({ id }) => ({
      column: id,
      items: live
        .filter((p) => p.showInFooter && resolveFooterColumn(p) === id)
        .map((p) => ({ pageId: p.id, label: p.navLabel || p.title })),
    })),
  };
}
