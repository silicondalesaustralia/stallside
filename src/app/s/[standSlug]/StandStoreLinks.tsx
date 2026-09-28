"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import StandShopDropdown from "./StandShopDropdown";
import {
  standCatalogPath,
  standPreOrdersPath,
  standSubscriptionsPath,
} from "@/lib/stand-seo";
import type { StandStoreNav } from "@/lib/stand-store-nav";
import {
  activeCategorySlug,
  activeStoreSection,
  type StandStoreLinkKey,
} from "@/lib/stand-store-active";

export type { StandStoreLinkKey } from "@/lib/stand-store-active";

function tabClass(active: boolean) {
  return `whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--leaf)] ${
    active
      ? "bg-[var(--leaf)] text-white"
      : "text-[var(--field)] hover:bg-[var(--wash)]"
  }`;
}

export function buildStandStoreLinks(
  standSlug: string,
  nav: StandStoreNav,
): { key: StandStoreLinkKey; label: string; href: string }[] {
  const links: { key: StandStoreLinkKey; label: string; href: string }[] = [];
  if (nav.showShop) {
    links.push({
      key: "shop",
      label: "Shop",
      href: standCatalogPath(standSlug),
    });
  }
  if (nav.showPreOrders) {
    links.push({
      key: "pre",
      label: "Pre-orders",
      href: standPreOrdersPath(standSlug),
    });
  }
  if (nav.showSubscriptions) {
    links.push({
      key: "sub",
      label: "Memberships",
      href: standSubscriptionsPath(standSlug),
    });
  }
  return links;
}

/** Desktop header tabs; Shop becomes a dropdown when categories exist. */
export default function StandStoreLinks({
  standSlug,
  nav,
  className,
}: {
  standSlug: string;
  nav: StandStoreNav;
  className?: string;
}) {
  const pathname = usePathname() ?? "";
  const links = buildStandStoreLinks(standSlug, nav);
  if (links.length === 0) return null;
  const section = activeStoreSection(pathname, standSlug);

  return (
    <nav aria-label="Shop sections" className={className}>
      {links.map((link) =>
        link.key === "shop" && nav.categories.length > 0 ? (
          <StandShopDropdown
            key={link.key}
            standSlug={standSlug}
            categories={nav.categories}
            active={section === "shop"}
            activeCategory={activeCategorySlug(pathname, standSlug)}
            tabClass={tabClass(section === "shop")}
          />
        ) : (
          <Link
            key={link.key}
            href={link.href}
            aria-current={section === link.key ? "page" : undefined}
            className={tabClass(section === link.key)}
          >
            {link.label}
          </Link>
        ),
      )}
    </nav>
  );
}
