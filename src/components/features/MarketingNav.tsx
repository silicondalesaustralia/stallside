"use client";

import Link from "next/link";
import FeaturesMegaMenu from "@/components/features/FeaturesMegaMenu";

type NavItem = { href: string; label: string } | { type: "features" };

const HOME_NAV: NavItem[] = [
  { href: "/sell", label: "What you make" },
  { type: "features" },
  { href: "#makers", label: "Our makers" },
  { href: "#community", label: "Community" },
  { href: "#pricing", label: "Pricing" },
];

const SELL_NAV: NavItem[] = [
  { href: "/sell", label: "What you make" },
  { type: "features" },
  { href: "/#makers", label: "Our makers" },
  { href: "/#community", label: "Community" },
  { href: "/#pricing", label: "Pricing" },
];

export default function MarketingNav({ variant }: { variant: "home" | "sell" }) {
  const items = variant === "home" ? HOME_NAV : SELL_NAV;

  return (
    <nav
      aria-label="Main navigation"
      className="hidden items-center gap-4 text-xs font-semibold text-[var(--field)] md:flex lg:gap-7 lg:text-sm"
    >
      {items.map((item) =>
        "type" in item ? (
          <FeaturesMegaMenu key="features" />
        ) : item.href.startsWith("#") || item.href.startsWith("/#") ? (
          <a key={item.href} href={item.href} className="hover:text-[var(--leaf)]">
            {item.label}
          </a>
        ) : (
          <Link key={item.href} href={item.href} className="hover:text-[var(--leaf)]">
            {item.label}
          </Link>
        ),
      )}
    </nav>
  );
}
