import { SOCIAL_SOON_FEATURES } from "@/components/social-soon-features";
import { DASH_NAV_GROUPS } from "@/components/dash-nav-groups";

export type DashNavLink = {
  href: string;
  label: string;
  /** Only shown to owners with the Website beta. */
  websiteOnly?: boolean;
  /** "Coming soon" for owners without the Social kit (opens its coming-soon page). */
  socialKit?: boolean;
  /** Extra path prefixes that count as this link (e.g. tabs that live elsewhere). */
  alsoActiveOn?: string[];
  /** Shown greyed with a "Soon" tag. */
  comingSoon?: boolean;
  /** What a "Soon" item will include, shown on hover. */
  soonFeatures?: readonly string[];
  /** Vendl Pro feature. */
  pro?: boolean;
  /** Set for Free owners on `pro` links: shows a PRO chip. */
  proLocked?: boolean;
};

export type DashNavGroup = {
  heading: string | null;
  links: DashNavLink[];
};

/** Which beta nav links the signed-in owner can see. */
export type NavAccess = { website: boolean; social: boolean; pro: boolean };

export const WHY_PRO_PATH = "/dashboard/why-pro";

/** Groups for the owner's access: Website-beta links removed, Social "Soon", Pro links chipped for Free; empty groups dropped. */
export function visibleNavGroups(showWebsite: boolean, showSocial = false, isPro = true): DashNavGroup[] {
  return DASH_NAV_GROUPS.map((group) => ({
    ...group,
    links: group.links
      .filter((link) => showWebsite || !link.websiteOnly)
      .map((link) =>
        link.socialKit && !showSocial
          ? { ...link, comingSoon: true, soonFeatures: SOCIAL_SOON_FEATURES }
          : link.pro && !isPro
            ? { ...link, proLocked: true }
            : link,
      ),
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
