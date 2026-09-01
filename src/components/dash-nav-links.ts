export type DashNavItem = {
  href: string;
  label: string;
  /** When set, item is visible but not navigable. */
  soon?: boolean;
};

export type DashNavGroup = {
  id: string;
  label: string;
  items: readonly DashNavItem[];
};

/** Desktop sidebar groups — live routes only; future tools marked soon. */
export const dashNavGroups: readonly DashNavGroup[] = [
  {
    id: "home",
    label: "Home",
    items: [
      { href: "/dashboard/getting-started", label: "Getting Started" },
      { href: "/dashboard", label: "Dashboard" },
    ],
  },
  {
    id: "sell",
    label: "Sell",
    items: [
      { href: "/dashboard/orders", label: "Orders" },
      { href: "/dashboard/products", label: "Products" },
      { href: "/dashboard/pre-order-pages", label: "Pre-orders" },
      { href: "/dashboard/subscriptions", label: "Subscriptions" },
      { href: "/dashboard/businesses", label: "Farm Stands" },
      { href: "/dashboard/collections", label: "Collections" },
    ],
  },
  {
    id: "customers",
    label: "Customers",
    items: [
      { href: "/dashboard/customers", label: "Customers", soon: true },
      { href: "/dashboard/messages", label: "Messages", soon: true },
      { href: "/dashboard/reviews", label: "Reviews", soon: true },
    ],
  },
  {
    id: "operate",
    label: "Operate",
    items: [
      { href: "/dashboard/notifications", label: "Notifications" },
      { href: "/dashboard/fulfilment", label: "Fulfilment", soon: true },
      { href: "/dashboard/recipes", label: "Recipes & Costs", soon: true },
    ],
  },
  {
    id: "grow",
    label: "Grow",
    items: [
      { href: "/dashboard/coupons", label: "Coupons", soon: true },
      { href: "/dashboard/marketing", label: "Marketing", soon: true },
      { href: "/dashboard/forms", label: "Forms", soon: true },
    ],
  },
  {
    id: "website",
    label: "Website",
    items: [
      { href: "/dashboard/website", label: "Website builder", soon: true },
      { href: "/dashboard/website/domains", label: "Domains", soon: true },
    ],
  },
  {
    id: "account",
    label: "Account",
    items: [
      { href: "/dashboard/settings/stripe", label: "Payments" },
      { href: "/dashboard/settings/billing", label: "Billing" },
      { href: "/dashboard/settings", label: "Settings" },
      { href: "/dashboard/knowledge", label: "Help" },
    ],
  },
] as const;

/** Flat live links for badges / active checks. */
export const primaryLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/products", label: "Products" },
  { href: "/dashboard/orders", label: "Orders" },
  { href: "/dashboard/collections", label: "Collections" },
] as const;

export const secondaryLinks = [
  { href: "/dashboard/getting-started", label: "Getting Started" },
  { href: "/dashboard/pre-order-pages", label: "Pre-orders" },
  { href: "/dashboard/subscriptions", label: "Subscriptions" },
  { href: "/dashboard/businesses", label: "Farm Stands" },
  { href: "/dashboard/notifications", label: "Notifications" },
  { href: "/dashboard/knowledge", label: "Help" },
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
  if (
    href === "/dashboard" ||
    href === "/admin" ||
    href === "/dashboard/settings"
  ) {
    return pathname === href;
  }
  return pathname.startsWith(href);
}

export function liveDashNavItems(): DashNavItem[] {
  return dashNavGroups.flatMap((g) => g.items.filter((i) => !i.soon));
}
