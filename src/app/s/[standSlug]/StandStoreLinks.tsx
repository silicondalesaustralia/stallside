import Link from "next/link";
import {
  standCatalogPath,
  standPreOrdersPath,
  standSubscriptionsPath,
} from "@/lib/stand-seo";

export const standStoreLinks = [
  { key: "shop", label: "Shop", href: standCatalogPath },
  { key: "pre", label: "Pre-orders", href: standPreOrdersPath },
  { key: "sub", label: "Subscriptions", href: standSubscriptionsPath },
] as const;

export default function StandStoreLinks({
  standSlug,
  onNavigate,
  className,
}: {
  standSlug: string;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <nav className={className}>
      {standStoreLinks.map((link) => (
        <Link
          key={link.key}
          href={link.href(standSlug)}
          onClick={onNavigate}
          className="text-[var(--leaf-dark)] underline"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
