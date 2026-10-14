import { shopHomePath, shopMenusPath, shopPagePath } from "@/lib/storefront/paths";
import type { StorefrontPageId } from "@/lib/storefront/types";
import type { StudioTemplateId } from "./types";
import type { StudioNavItem } from "./navigation";

const SHOP_LABEL: Record<StudioTemplateId, string> = {
  artisan: "Shop",
  farmhouse: "What's available",
  market: "Shop",
};

/** The header links shown when the seller hasn't built their own menu. */
export function buildAutoNavItems(input: {
  enabledPages: StorefrontPageId[];
  storefrontSlug: string;
  draft?: boolean;
  basePath?: string;
  templateId: StudioTemplateId;
  hasMenus?: boolean;
  customNavPages: StudioNavItem[];
}): StudioNavItem[] {
  const items: StudioNavItem[] = [];
  const { enabledPages, storefrontSlug, draft, basePath, templateId, hasMenus, customNavPages } =
    input;
  if (enabledPages.includes("home")) {
    items.push({ slug: "home", label: "Home", href: shopHomePath(storefrontSlug, draft, basePath) });
  }
  if (enabledPages.includes("shop")) {
    items.push({
      slug: "shop",
      label: SHOP_LABEL[templateId],
      href: shopPagePath(storefrontSlug, "shop", draft, basePath),
    });
  }
  if (hasMenus) {
    items.push({ slug: "menu", label: "Menus", href: shopMenusPath(storefrontSlug, draft, basePath) });
  }
  if (customNavPages.length > 0) {
    items.push(...customNavPages);
  } else {
    if (enabledPages.includes("about")) {
      items.push({
        slug: "about",
        label: templateId === "farmhouse" ? "Our farm" : "About",
        href: shopPagePath(storefrontSlug, "about", draft, basePath),
      });
    }
    if (enabledPages.includes("contact")) {
      items.push({
        slug: "contact",
        label: "Contact",
        href: shopPagePath(storefrontSlug, "contact", draft, basePath),
      });
    }
  }
  return items;
}
