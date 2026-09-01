import {
  normalizeBusinessMode,
  primaryLocationLabel,
  type BusinessMode,
} from "@/lib/business-mode";

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
export function dashNavGroupsForMode(
  modeInput?: string | null,
): DashNavGroup[] {
  const mode = normalizeBusinessMode(modeInput);
  const locationsLabel = primaryLocationLabel(mode);

  return [
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
        { href: "/dashboard/categories", label: "Categories" },
        { href: "/dashboard/pre-order-pages", label: "Pre-orders" },
        { href: "/dashboard/subscriptions", label: "Subscriptions" },
        { href: "/dashboard/collections", label: "Collections" },
      ],
    },
    {
      id: "customers",
      label: "Customers",
      items: [
        { href: "/dashboard/customers", label: "Customers" },
        { href: "/dashboard/messages", label: "Messages", soon: true },
        { href: "/dashboard/reviews", label: "Reviews", soon: true },
      ],
    },
    {
      id: "operate",
      label: "Operate",
      items: [
        { href: "/dashboard/businesses", label: locationsLabel },
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
        { href: "/dashboard/website", label: "Online shop" },
        { href: "/dashboard/website/domains", label: "Domains" },
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
  ];
}

/** @deprecated Prefer dashNavGroupsForMode */
export const dashNavGroups = dashNavGroupsForMode("BOTH");

export const primaryLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/products", label: "Products" },
  { href: "/dashboard/orders", label: "Orders" },
  { href: "/dashboard/collections", label: "Collections" },
] as const;

export function secondaryLinksForMode(modeInput?: string | null) {
  const mode = normalizeBusinessMode(modeInput) as BusinessMode;
  return [
    { href: "/dashboard/getting-started", label: "Getting Started" },
    { href: "/dashboard/pre-order-pages", label: "Pre-orders" },
    { href: "/dashboard/subscriptions", label: "Subscriptions" },
    {
      href: "/dashboard/businesses",
      label: primaryLocationLabel(mode),
    },
    { href: "/dashboard/notifications", label: "Notifications" },
    { href: "/dashboard/knowledge", label: "Help" },
    { href: "/dashboard/settings", label: "Settings" },
  ] as const;
}

/** @deprecated Prefer secondaryLinksForMode */
export const secondaryLinks = secondaryLinksForMode("BOTH");

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

export function liveDashNavItems(modeInput?: string | null): DashNavItem[] {
  return dashNavGroupsForMode(modeInput).flatMap((g) =>
    g.items.filter((i) => !i.soon),
  );
}
