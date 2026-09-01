"use client";

import Image from "next/image";
import Link from "next/link";
import { useSyncExternalStore, useCallback } from "react";
import BrandMark from "@/components/BrandMark";
import {
  cartItemCount,
  getStandCartEpoch,
  readStandCartLines,
  subscribeStandCart,
} from "@/lib/stand-cart-storage";
import { standCartPath } from "@/lib/stand-seo";
import {
  shopHomePath,
  shopPagePath,
} from "@/lib/storefront/paths";
import type { StorefrontPageId } from "@/lib/storefront/types";
import type { ResolvedStorefrontBranding } from "@/lib/storefront/types";

export default function StorefrontNav({
  storefrontSlug,
  standSlug,
  branding,
  activePage,
  enabledPages,
  draft,
}: {
  storefrontSlug: string;
  standSlug: string;
  branding: ResolvedStorefrontBranding;
  activePage: StorefrontPageId | "product";
  enabledPages: StorefrontPageId[];
  draft?: boolean;
}) {
  const subscribe = useCallback(
    (onStoreChange: () => void) => subscribeStandCart(onStoreChange),
    [],
  );
  const getSnapshot = useCallback(() => {
    void getStandCartEpoch();
    return cartItemCount(readStandCartLines(standSlug));
  }, [standSlug]);
  const cartCount = useSyncExternalStore(subscribe, getSnapshot, () => 0);

  const navItems: { id: StorefrontPageId; label: string }[] = (
    [
      { id: "home" as const, label: "Home" },
      { id: "shop" as const, label: "Shop" },
      { id: "about" as const, label: "About" },
      { id: "contact" as const, label: "Contact" },
    ] as const
  ).filter((item) => enabledPages.includes(item.id));

  function hrefFor(page: StorefrontPageId) {
    if (page === "home") return shopHomePath(storefrontSlug, draft);
    return shopPagePath(storefrontSlug, page, draft);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[var(--panel)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href={shopHomePath(storefrontSlug, draft)}
          className="flex min-w-0 items-center gap-3"
        >
          {branding.logoUrl ? (
            <Image
              src={branding.logoUrl}
              alt=""
              width={120}
              height={48}
              className="h-10 w-auto max-w-[120px] object-contain"
            />
          ) : (
            <BrandMark className="size-9 shrink-0" />
          )}
          <span className="truncate font-[family-name:var(--font-display)] text-lg font-bold text-[var(--field)]">
            {branding.headline}
          </span>
        </Link>
        <nav className="hidden items-center gap-1 sm:flex">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={hrefFor(item.id)}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                activePage === item.id
                  ? "bg-[var(--leaf)] text-white"
                  : "text-[var(--muted)] hover:bg-[var(--wash)] hover:text-[var(--field)]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        {cartCount > 0 ? (
          <Link
            href={standCartPath(standSlug)}
            className="shrink-0 rounded-full bg-[var(--leaf)] px-4 py-2 text-sm font-semibold text-white"
          >
            Cart ({cartCount})
          </Link>
        ) : null}
      </div>
      <nav className="flex gap-1 overflow-x-auto px-4 pb-3 sm:hidden">
        {navItems.map((item) => (
          <Link
            key={item.id}
            href={hrefFor(item.id)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
              activePage === item.id
                ? "bg-[var(--leaf)] text-white"
                : "bg-[var(--wash)] text-[var(--muted)]"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
