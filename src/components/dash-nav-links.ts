export type DashNavLink = {
  href: string;
  label: string;
  /** Only shown to owners with the Website beta. */
  websiteOnly?: boolean;
  /** Extra path prefixes that count as this link (e.g. tabs that live elsewhere). */
  alsoActiveOn?: string[];
};

export type DashNavGroup = {
  heading: string | null;
  links: DashNavLink[];
};

const WEB_STUDIO_PREFIXES = [
  "/dashboard/website/details",
  "/dashboard/website/basics",
  "/dashboard/website/branding",
  "/dashboard/website/ai",
  "/dashboard/website/studio",
  "/dashboard/website/craft-spike",
  "/dashboard/website/puck-spike",
];

export const DASH_NAV_GROUPS: DashNavGroup[] = [
  { heading: null, links: [{ href: "/dashboard", label: "Overview" }] },
  {
    heading: "Pages & Posts",
    links: [
      { href: "/dashboard/categories", label: "Product categories" },
      { href: "/dashboard/products", label: "Products", alsoActiveOn: ["/dashboard/inventory"] },
      { href: "/dashboard/pre-order-pages", label: "Pre-order pages" },
      { href: "/dashboard/subscriptions", label: "Subscriptions" },
      { href: "/dashboard/website/pages", label: "Pages", websiteOnly: true },
      { href: "/dashboard/website/blog/topics", label: "Blog Categories", websiteOnly: true },
      { href: "/dashboard/website/blog", label: "Blog Posts", websiteOnly: true },
    ],
  },
  {
    heading: "Marketing",
    links: [
      { href: "/dashboard/communication", label: "Communications" },
      { href: "/dashboard/social", label: "Social" },
    ],
  },
  {
    heading: "Operations",
    links: [
      { href: "/dashboard/orders", label: "Orders" },
      { href: "/dashboard/customers", label: "Customers" },
      { href: "/dashboard/suppliers", label: "Suppliers" },
      { href: "/dashboard/collections", label: "Pick Ups & Delivery" },
      { href: "/dashboard/calendar", label: "Calendar" },
      { href: "/dashboard/qr", label: "QR codes" },
    ],
  },
  {
    heading: "Website",
    links: [
      {
        href: "/dashboard/website/web-studio",
        label: "Web Studio",
        websiteOnly: true,
        alsoActiveOn: WEB_STUDIO_PREFIXES,
      },
      { href: "/dashboard/website/redirects", label: "Redirects", websiteOnly: true },
      { href: "/dashboard/website/domains", label: "Domains", websiteOnly: true },
    ],
  },
  {
    heading: "Settings",
    links: [
      {
        href: "/dashboard/payments",
        label: "Payments",
        alsoActiveOn: ["/dashboard/settings/stripe", "/dashboard/settings/square", "/dashboard/settings/paypal"],
      },
      { href: "/dashboard/settings", label: "Account" },
    ],
  },
  {
    heading: null,
    links: [
      { href: "/dashboard/notifications", label: "Notifications" },
      { href: "/dashboard/knowledge", label: "Guides" },
      { href: "/dashboard/connectors", label: "Connectors" },
    ],
  },
];

/** Groups with Website-beta links removed for owners without access; empty groups dropped. */
export function visibleNavGroups(showWebsite: boolean): DashNavGroup[] {
  return DASH_NAV_GROUPS.map((group) => ({
    ...group,
    links: group.links.filter((link) => showWebsite || !link.websiteOnly),
  })).filter((group) => group.links.length > 0);
}

/** Website-beta links, used as tabs inside /dashboard/website on small screens. */
export const WEBSITE_NAV_LINKS: DashNavLink[] = DASH_NAV_GROUPS.flatMap((g) =>
  g.links.filter((link) => link.websiteOnly),
);

export const mobileTabs = [
  { href: "/dashboard", label: "Home" },
  { href: "/dashboard/products", label: "Products" },
  { href: "/dashboard/orders", label: "Orders" },
  { href: "/dashboard/collections", label: "Pick ups" },
  { href: "/dashboard/notifications", label: "Alerts" },
] as const;

function matchLength(pathname: string, link: DashNavLink): number {
  if (link.href === "/dashboard") return pathname === "/dashboard" ? link.href.length : -1;
  const prefixes = [link.href, ...(link.alsoActiveOn ?? [])];
  let best = -1;
  for (const prefix of prefixes) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      best = Math.max(best, prefix.length);
    }
  }
  if (link.href === "/dashboard/website/web-studio" && pathname === "/dashboard/website") {
    best = Math.max(best, pathname.length);
  }
  return best;
}

/** The single most specific nav link matching the current path, so nested links don't both light up. */
export function activeNavHref(pathname: string, links: DashNavLink[]): string | null {
  let bestHref: string | null = null;
  let bestLength = -1;
  for (const link of links) {
    const length = matchLength(pathname, link);
    if (length > bestLength) {
      bestLength = length;
      bestHref = link.href;
    }
  }
  return bestHref;
}

export function dashLinkActive(pathname: string, href: string) {
  if (href === "/dashboard" || href === "/admin") return pathname === href;
  return pathname.startsWith(href);
}
