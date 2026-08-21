import Link from "next/link";
import {
  standCatalogPath,
  standPreOrdersPath,
  standSubscriptionsPath,
} from "@/lib/stand-seo";
import type { StandStoreNav } from "@/lib/stand-store-nav";

export type StandStoreLinkKey = "shop" | "pre" | "sub";

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
      label: "Subscriptions",
      href: standSubscriptionsPath(standSlug),
    });
  }
  return links;
}

export default function StandStoreLinks({
  standSlug,
  nav,
  onNavigate,
  className,
}: {
  standSlug: string;
  nav: StandStoreNav;
  onNavigate?: () => void;
  className?: string;
}) {
  const links = buildStandStoreLinks(standSlug, nav);
  if (links.length === 0) return null;

  return (
    <nav className={className}>
      {links.map((link) => (
        <Link
          key={link.key}
          href={link.href}
          onClick={onNavigate}
          className="text-[var(--leaf-dark)] underline"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
