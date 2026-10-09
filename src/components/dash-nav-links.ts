export const primaryLinks = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/products", label: "Products" },
  { href: "/dashboard/orders", label: "Orders" },
  { href: "/dashboard/customers", label: "Customers" },
  { href: "/dashboard/collections", label: "Collections" },
] as const;

export const websiteLink = {
  href: "/dashboard/website/web-studio",
  label: "Website",
} as const;

export const secondaryLinks = [
  { href: "/dashboard/pre-order-pages", label: "Pre-order pages" },
  { href: "/dashboard/subscriptions", label: "Subscriptions" },
  { href: "/dashboard/payments", label: "Payments" },
  { href: "/dashboard/communication", label: "Communication" },
  { href: "/dashboard/social", label: "Social" },
  { href: "/dashboard/notifications", label: "Notifications" },
  { href: "/dashboard/suppliers", label: "Suppliers" },
  { href: "/dashboard/knowledge", label: "Guides" },
  { href: "/dashboard/settings", label: "Settings" },
] as const;

export const mobileTabs = [
  { href: "/dashboard", label: "Home" },
  { href: "/dashboard/products", label: "Products" },
  { href: "/dashboard/orders", label: "Orders" },
  { href: "/dashboard/collections", label: "Collect" },
  { href: "/dashboard/notifications", label: "Alerts" },
] as const;

export type HubNavItem = {
  href: string;
  label: string;
  /** Prefix match for active state (supports query-only differences). */
  matchPrefix?: string;
};

/** Website sub-sections — Web Studio create-flow first, then site tools. */
export const WEBSITE_HUB_NAV: HubNavItem[] = [
  { href: "/dashboard/website/web-studio", label: "Web Studio", matchPrefix: "/dashboard/website/web-studio" },
  { href: "/dashboard/website/pages", label: "Pages", matchPrefix: "/dashboard/website/pages" },
  { href: "/dashboard/website/commerce", label: "Commerce", matchPrefix: "/dashboard/website/commerce" },
  { href: "/dashboard/website/navigation", label: "Navigation", matchPrefix: "/dashboard/website/navigation" },
  { href: "/dashboard/website/blog", label: "Blog", matchPrefix: "/dashboard/website/blog" },
  { href: "/dashboard/website/seo", label: "SEO", matchPrefix: "/dashboard/website/seo" },
  { href: "/dashboard/website/domains", label: "Domains", matchPrefix: "/dashboard/website/domains" },
  { href: "/dashboard/website/qr", label: "QR codes", matchPrefix: "/dashboard/website/qr" },
];

const WEB_STUDIO_PREFIXES = [
  "/dashboard/website/web-studio",
  "/dashboard/website/details",
  "/dashboard/website/basics",
  "/dashboard/website/branding",
  "/dashboard/website/ai",
  "/dashboard/website/studio",
  "/dashboard/website/craft-spike",
  "/dashboard/website/puck-spike",
];

export function hubNavItemActive(pathname: string, item: HubNavItem): boolean {
  const prefix = item.matchPrefix ?? item.href.split("?")[0];
  if (prefix === "/dashboard/website/web-studio") {
    return (
      pathname === "/dashboard/website" ||
      WEB_STUDIO_PREFIXES.some((p) => pathname.startsWith(p))
    );
  }
  return pathname.startsWith(prefix);
}

export function dashLinkActive(pathname: string, href: string) {
  if (href === "/dashboard" || href === "/admin") return pathname === href;
  if (href === websiteLink.href) return pathname.startsWith("/dashboard/website");
  return pathname.startsWith(href);
}
