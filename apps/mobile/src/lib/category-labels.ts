import type { MobileCategory } from "@contracts/mobile/categories";

/** "4 products · Hidden from shop menu", like the web Categories list. */
export function categoryDetail(category: MobileCategory): string {
  const count = `${category.productCount} product${category.productCount === 1 ? "" : "s"}`;
  return category.isActive && !category.showOnWebsite ? `${count} · Hidden from shop menu` : count;
}
