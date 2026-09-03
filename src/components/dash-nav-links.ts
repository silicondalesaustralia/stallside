import {
  normalizeBusinessMode,
  primaryLocationLabel,
  type BusinessMode,
} from "@/lib/business-mode";

export type DashNavItem = {
  href: string;
  label: string;
  soon?: boolean;
};

/** Always pinned above primary nav — not inside More tools. */
export const GETTING_STARTED_NAV: DashNavItem = {
  href: "/dashboard/getting-started",
  label: "Getting started",
};

/** @deprecated Groups replaced by flat primary nav in Phase 8C. */
export type DashNavGroup = {
  id: string;
  label: string;
  items: readonly DashNavItem[];
};

export type HubNavItem = {
  href: string;
  label: string;
  /** Prefix match for active state (supports query-only differences). */
  matchPrefix?: string;
};

/** Major sidebar destinations — object-first, ~9 items. */
export function primaryNavForMode(modeInput?: string | null): DashNavItem[] {
  const mode = normalizeBusinessMode(modeInput);
  const farmLabel =
    mode === "FOOD_BUSINESS" ? "Shop" : mode === "BOTH" ? "Locations" : "Farm Stand";

  const items: DashNavItem[] = [
    { href: "/dashboard", label: "Home" },
    { href: "/dashboard/orders", label: "Orders" },
    { href: "/dashboard/products", label: "Products" },
    { href: "/dashboard/customers", label: "Customers" },
  ];

  if (mode !== "FARM_STAND") {
    items.push({ href: "/dashboard/menus", label: "Menus" });
  }

  items.push(
    { href: "/dashboard/calendar", label: "Calendar" },
    { href: "/dashboard/marketing", label: "Marketing" },
    { href: "/dashboard/website/studio", label: "Website" },
  );

  if (mode !== "FOOD_BUSINESS") {
    items.push({ href: "/dashboard/businesses", label: farmLabel });
  }

  items.push({ href: "/dashboard/settings", label: "Settings" });

  return items;
}

/** Secondary tools — not in primary sidebar; reachable via More / contextual links. */
export function secondaryNavForMode(modeInput?: string | null): DashNavItem[] {
  const mode = normalizeBusinessMode(modeInput);
  const locationsLabel = primaryLocationLabel(mode);

  return [
    { href: "/dashboard/notifications", label: "Notifications" },
    { href: "/dashboard/production", label: "Production" },
    { href: "/dashboard/collections", label: "Collections" },
    { href: "/dashboard/pre-order-pages", label: "Pre-orders" },
    { href: "/dashboard/subscriptions", label: "Subscriptions" },
    { href: "/dashboard/fulfilment", label: "Fulfilment setup" },
    { href: "/dashboard/forms", label: "Custom orders" },
    { href: "/dashboard/events", label: "Markets & events" },
    { href: "/dashboard/categories", label: "Categories" },
    { href: "/dashboard/operate", label: "Operate overview" },
    { href: "/dashboard/businesses", label: locationsLabel },
    { href: "/dashboard/knowledge", label: "Help" },
    { href: "/dashboard/settings/stripe", label: "Payments" },
    { href: "/dashboard/settings/billing", label: "Billing" },
  ];
}

/** Orders hub secondary navigation. */
export const ORDERS_HUB_NAV: HubNavItem[] = [
  { href: "/dashboard/orders", label: "All", matchPrefix: "/dashboard/orders" },
  {
    href: "/dashboard/fulfilment/orders?view=today",
    label: "Prepare & pack",
    matchPrefix: "/dashboard/fulfilment/orders",
  },
  {
    href: "/dashboard/production?range=week",
    label: "Production",
    matchPrefix: "/dashboard/production",
  },
  {
    href: "/dashboard/collections",
    label: "Pickup",
    matchPrefix: "/dashboard/collections",
  },
  {
    href: "/dashboard/fulfilment/orders/print/delivery",
    label: "Delivery",
    matchPrefix: "/dashboard/fulfilment/orders/print/delivery",
  },
  { href: "/dashboard/forms", label: "Custom", matchPrefix: "/dashboard/forms" },
];

/** Products catalogue hub. */
export const PRODUCTS_HUB_NAV: HubNavItem[] = [
  { href: "/dashboard/products", label: "Products", matchPrefix: "/dashboard/products" },
  { href: "/dashboard/categories", label: "Categories", matchPrefix: "/dashboard/categories" },
  { href: "/dashboard/recipes", label: "Recipes", matchPrefix: "/dashboard/recipes" },
  {
    href: "/dashboard/ingredients",
    label: "Ingredients",
    matchPrefix: "/dashboard/ingredients",
  },
];

/** Customers CRM hub. */
export const CUSTOMERS_HUB_NAV: HubNavItem[] = [
  {
    href: "/dashboard/customers",
    label: "Customers",
    matchPrefix: "/dashboard/customers",
  },
  {
    href: "/dashboard/customers/segments",
    label: "Segments",
    matchPrefix: "/dashboard/customers/segments",
  },
];

/** Marketing (Phase 7 Grow consolidated). */
export const MARKETING_HUB_NAV: HubNavItem[] = [
  { href: "/dashboard/marketing", label: "Overview", matchPrefix: "/dashboard/marketing" },
  { href: "/dashboard/campaigns", label: "Campaigns", matchPrefix: "/dashboard/campaigns" },
  { href: "/dashboard/coupons", label: "Discounts", matchPrefix: "/dashboard/coupons" },
  { href: "/dashboard/loyalty", label: "Loyalty", matchPrefix: "/dashboard/loyalty" },
  { href: "/dashboard/reviews", label: "Reviews", matchPrefix: "/dashboard/reviews" },
  { href: "/dashboard/gift-cards", label: "Gift cards", matchPrefix: "/dashboard/gift-cards" },
];

/** Website hub — studio, pages, navigation, blog, seo, domains. */
export const WEBSITE_HUB_NAV: HubNavItem[] = [
  {
    href: "/dashboard/website/studio",
    label: "Studio",
    matchPrefix: "/dashboard/website/studio",
  },
  {
    href: "/dashboard/website/details",
    label: "Details",
    matchPrefix: "/dashboard/website/details",
  },
  {
    href: "/dashboard/website/pages",
    label: "Pages",
    matchPrefix: "/dashboard/website/pages",
  },
  {
    href: "/dashboard/website/commerce",
    label: "Commerce",
    matchPrefix: "/dashboard/website/commerce",
  },
  {
    href: "/dashboard/website/navigation",
    label: "Navigation",
    matchPrefix: "/dashboard/website/navigation",
  },
  {
    href: "/dashboard/website/blog",
    label: "Blog",
    matchPrefix: "/dashboard/website/blog",
  },
  {
    href: "/dashboard/website/seo",
    label: "SEO",
    matchPrefix: "/dashboard/website/seo",
  },
  {
    href: "/dashboard/website/domains",
    label: "Domains",
    matchPrefix: "/dashboard/website/domains",
  },
];

/** Settings sections (configuration, not day-to-day ops). */
export const SETTINGS_HUB_NAV: HubNavItem[] = [
  { href: "/dashboard/settings", label: "General", matchPrefix: "/dashboard/settings" },
  {
    href: "/dashboard/settings/stripe",
    label: "Payments",
    matchPrefix: "/dashboard/settings/stripe",
  },
  {
    href: "/dashboard/settings/billing",
    label: "Plan & billing",
    matchPrefix: "/dashboard/settings/billing",
  },
  {
    href: "/dashboard/fulfilment",
    label: "Fulfilment",
    matchPrefix: "/dashboard/fulfilment",
  },
  {
    href: "/dashboard/notifications",
    label: "Notifications",
    matchPrefix: "/dashboard/notifications",
  },
];

/** Resolve which hub subnav applies to pathname. */
export function hubNavForPath(pathname: string): HubNavItem[] | null {
  if (
    pathname.startsWith("/dashboard/orders") ||
    pathname.startsWith("/dashboard/fulfilment/orders") ||
    pathname.startsWith("/dashboard/production") ||
    pathname.startsWith("/dashboard/collections") ||
    pathname.startsWith("/dashboard/forms")
  ) {
    return ORDERS_HUB_NAV;
  }
  if (
    pathname.startsWith("/dashboard/products") ||
    pathname.startsWith("/dashboard/categories") ||
    pathname.startsWith("/dashboard/recipes") ||
    pathname.startsWith("/dashboard/ingredients")
  ) {
    return PRODUCTS_HUB_NAV;
  }
  if (pathname.startsWith("/dashboard/customers")) {
    return CUSTOMERS_HUB_NAV;
  }
  if (
    pathname.startsWith("/dashboard/marketing") ||
    pathname.startsWith("/dashboard/grow") ||
    pathname.startsWith("/dashboard/campaigns") ||
    pathname.startsWith("/dashboard/coupons") ||
    pathname.startsWith("/dashboard/loyalty") ||
    pathname.startsWith("/dashboard/reviews") ||
    pathname.startsWith("/dashboard/gift-cards")
  ) {
    return MARKETING_HUB_NAV;
  }
  if (pathname.startsWith("/dashboard/website")) {
    return WEBSITE_HUB_NAV;
  }
  if (
    pathname.startsWith("/dashboard/settings") ||
    pathname === "/dashboard/fulfilment" ||
    pathname.startsWith("/dashboard/fulfilment/") ||
    pathname.startsWith("/dashboard/notifications")
  ) {
    if (pathname.startsWith("/dashboard/fulfilment/orders")) return null;
    if (
      pathname.startsWith("/dashboard/settings") ||
      pathname === "/dashboard/fulfilment" ||
      pathname.startsWith("/dashboard/fulfilment/locations") ||
      pathname.startsWith("/dashboard/fulfilment/pickup") ||
      pathname.startsWith("/dashboard/fulfilment/delivery") ||
      pathname.startsWith("/dashboard/notifications")
    ) {
      return SETTINGS_HUB_NAV;
    }
  }
  return null;
}

export function hubNavItemActive(pathname: string, item: HubNavItem): boolean {
  const prefix = item.matchPrefix ?? item.href.split("?")[0];
  if (prefix === "/dashboard/orders") {
    return (
      pathname === "/dashboard/orders" ||
      (pathname.startsWith("/dashboard/orders/") &&
        !pathname.startsWith("/dashboard/orders/print"))
    );
  }
  if (item.label === "Prepare & pack") {
    return (
      pathname.startsWith("/dashboard/fulfilment/orders") &&
      !pathname.includes("/print/")
    );
  }
  if (item.matchPrefix === "/dashboard/website/studio") {
    return (
      pathname.startsWith("/dashboard/website/studio") ||
      pathname === "/dashboard/website" ||
      pathname.startsWith("/dashboard/website/craft-spike") ||
      pathname.startsWith("/dashboard/website/puck-spike")
    );
  }
  return pathname.startsWith(prefix);
}

/** @deprecated Use primaryNavForMode + secondaryNavForMode */
export function dashNavGroupsForMode(modeInput?: string | null): DashNavGroup[] {
  const primary = primaryNavForMode(modeInput);
  const secondary = secondaryNavForMode(modeInput);
  return [
    { id: "primary", label: "Main", items: primary },
    { id: "more", label: "More", items: secondary },
  ];
}

export const dashNavGroups = dashNavGroupsForMode("BOTH");

export const primaryLinks = primaryNavForMode("BOTH");

export function secondaryLinksForMode(modeInput?: string | null) {
  return secondaryNavForMode(modeInput);
}

export const secondaryLinks = secondaryNavForMode("BOTH");

export function mobileTabsForMode(modeInput?: string | null) {
  const mode = normalizeBusinessMode(modeInput);
  const tabs = [
    { href: "/dashboard", label: "Home" },
    { href: "/dashboard/orders", label: "Orders" },
    { href: "/dashboard/products", label: "Products" },
    { href: "/dashboard/calendar", label: "Calendar" },
  ] as const;
  if (mode === "FOOD_BUSINESS" || mode === "BOTH") {
    return [
      { href: "/dashboard", label: "Home" },
      { href: "/dashboard/menus", label: "Menus" },
      { href: "/dashboard/orders", label: "Orders" },
      { href: "/dashboard/calendar", label: "Calendar" },
      { href: "/dashboard/products", label: "Products" },
    ] as const;
  }
  return tabs;
}

/** @deprecated Use mobileTabsForMode */
export const mobileTabs = mobileTabsForMode("BOTH");

export function dashLinkActive(pathname: string, href: string) {
  const base = href.split("?")[0];
  if (
    base === "/dashboard" ||
    base === "/admin" ||
    base === "/dashboard/settings"
  ) {
    return pathname === base;
  }
  if (base === "/dashboard/marketing") {
    return (
      pathname.startsWith("/dashboard/marketing") ||
      pathname.startsWith("/dashboard/grow") ||
      pathname.startsWith("/dashboard/campaigns") ||
      pathname.startsWith("/dashboard/coupons")
    );
  }
  return pathname.startsWith(base);
}

export function liveDashNavItems(modeInput?: string | null): DashNavItem[] {
  return [
    ...primaryNavForMode(modeInput),
    ...secondaryNavForMode(modeInput),
  ].filter((i) => !i.soon);
}
