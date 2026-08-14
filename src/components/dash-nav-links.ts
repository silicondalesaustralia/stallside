export const primaryLinks = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/products", label: "Products" },
  { href: "/dashboard/orders", label: "Orders" },
  { href: "/dashboard/collections", label: "Collections" },
] as const;

export const secondaryLinks = [
  { href: "/dashboard/pre-order-pages", label: "Pre-order pages" },
  { href: "/dashboard/subscriptions", label: "Subscriptions" },
  { href: "/dashboard/notifications", label: "Notifications" },
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

export function dashLinkActive(pathname: string, href: string) {
  if (href === "/dashboard" || href === "/admin") return pathname === href;
  return pathname.startsWith(href);
}
