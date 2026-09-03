"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useSyncExternalStore, useCallback } from "react";
import {
  cartItemCount,
  getStandCartEpoch,
  readStandCartLines,
  subscribeStandCart,
} from "@/lib/stand-cart-storage";
import { standCartPath } from "@/lib/stand-seo";
import { shopHomePath, shopMenusPath, shopPagePath } from "@/lib/storefront/paths";
import type { StorefrontPageId } from "@/lib/storefront/types";
import type { ResolvedStorefrontBranding } from "@/lib/storefront/types";
import type { StudioTemplateId } from "@/lib/studio/types";
import { resolveStudioTemplate } from "@/lib/studio/templates";

const SHOP_LABEL: Record<StudioTemplateId, string> = {
  artisan: "Shop",
  farmhouse: "What's available",
  market: "Shop",
};

export default function StudioStorefrontNav({
  storefrontSlug,
  standSlug,
  branding,
  activePage,
  enabledPages,
  draft,
  basePath,
  templateId,
  hasMenus,
  customNavPages = [],
}: {
  storefrontSlug: string;
  standSlug: string;
  branding: ResolvedStorefrontBranding;
  activePage: StorefrontPageId | "product" | "menu" | string;
  enabledPages: StorefrontPageId[];
  draft?: boolean;
  basePath?: string;
  templateId: StudioTemplateId;
  hasMenus?: boolean;
  customNavPages?: { slug: string; label: string; href: string }[];
}) {
  const [open, setOpen] = useState(false);
  const template = resolveStudioTemplate(templateId, "FOOD_BUSINESS");
  const subscribe = useCallback(
    (onStoreChange: () => void) => subscribeStandCart(onStoreChange),
    [],
  );
  const getSnapshot = useCallback(() => {
    void getStandCartEpoch();
    return cartItemCount(readStandCartLines(standSlug));
  }, [standSlug]);
  const cartCount = useSyncExternalStore(subscribe, getSnapshot, () => 0);

  const navItems: { id: string; label: string; href: string }[] = [];
  if (enabledPages.includes("home")) {
    navItems.push({
      id: "home",
      label: "Home",
      href: shopHomePath(storefrontSlug, draft, basePath),
    });
  }
  if (enabledPages.includes("shop")) {
    navItems.push({
      id: "shop",
      label: SHOP_LABEL[templateId],
      href: shopPagePath(storefrontSlug, "shop", draft, basePath),
    });
  }
  if (hasMenus) {
    navItems.push({
      id: "menu",
      label: "Menus",
      href: shopMenusPath(storefrontSlug, draft, basePath),
    });
  }
  if (customNavPages.length > 0) {
    for (const page of customNavPages) {
      navItems.push({ id: page.slug, label: page.label, href: page.href });
    }
  } else {
    if (enabledPages.includes("about")) {
      navItems.push({
        id: "about",
        label: templateId === "farmhouse" ? "Our farm" : "About",
        href: shopPagePath(storefrontSlug, "about", draft, basePath),
      });
    }
    if (enabledPages.includes("contact")) {
      navItems.push({
        id: "contact",
        label: "Contact",
        href: shopPagePath(storefrontSlug, "contact", draft, basePath),
      });
    }
  }

  const navClass =
    template.headerVariant === "editorial"
      ? "studio-nav studio-nav--artisan"
      : template.headerVariant === "farm-gate"
        ? "studio-nav studio-nav--farmhouse"
        : "studio-nav studio-nav--market";

  return (
    <header className={`${navClass} sticky top-0 z-30 border-b border-[var(--line)] bg-[var(--panel)]/95 backdrop-blur`}>
      <div className="mx-auto flex max-w-[var(--studio-content-max)] items-center justify-between gap-4 px-4 py-3 sm:px-8 sm:py-4">
        <Link
          href={shopHomePath(storefrontSlug, draft, basePath)}
          className="flex min-w-0 items-center gap-3"
        >
          {branding.logoUrl ? (
            <Image
              src={branding.logoUrl}
              alt=""
              width={120}
              height={48}
              className="h-9 w-auto max-w-[120px] object-contain"
            />
          ) : null}
          <span className="studio-nav__brand truncate">{branding.headline}</span>
        </Link>
        {templateId === "farmhouse" && branding.regionLabel ? (
          <p className="hidden text-sm text-[var(--muted)] lg:block">{branding.regionLabel}</p>
        ) : null}
        <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`studio-nav__link ${activePage === item.id ? "is-active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {cartCount > 0 ? (
            <Link href={standCartPath(standSlug)} className="studio-btn studio-btn--secondary text-sm">
              Cart ({cartCount})
            </Link>
          ) : null}
          <button
            type="button"
            className="studio-nav__menu-btn md:hidden"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            Menu
          </button>
        </div>
      </div>
      {open ? (
        <nav className="border-t border-[var(--line)] px-4 py-3 md:hidden" aria-label="Mobile">
          <ul className="flex flex-col gap-2">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="block py-2 text-sm font-semibold text-[var(--field)]"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
