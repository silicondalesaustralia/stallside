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
import type { StudioNavItem } from "@/lib/studio/navigation";
import { resolveStudioTemplate } from "@/lib/studio/templates";

const SHOP_LABEL: Record<StudioTemplateId, string> = {
  artisan: "Shop",
  farmhouse: "What's available",
  market: "Shop",
};

function NavDropdown({ item }: { item: StudioNavItem }) {
  if (!item.children?.length) {
    return (
      <Link href={item.href} className="studio-nav__link">
        {item.label}
      </Link>
    );
  }
  return (
    <div className="group relative">
      <button
        type="button"
        className="studio-nav__link inline-flex items-center gap-1"
        aria-haspopup="menu"
      >
        {item.label}
        <span aria-hidden className="text-[10px]">
          ▾
        </span>
      </button>
      <div className="invisible absolute left-0 top-full z-40 min-w-[10rem] pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        <ul
          role="menu"
          className="rounded-lg border border-[var(--line)] bg-[var(--panel)] py-1 shadow-md"
        >
          {item.children.map((child) => (
            <li key={child.slug} role="none">
              <Link
                role="menuitem"
                href={child.href}
                className="block px-3 py-2 text-sm text-[var(--field)] hover:bg-[var(--wash)]"
              >
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

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
  customNavPages?: StudioNavItem[];
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

  const navItems: StudioNavItem[] = [];
  if (enabledPages.includes("home")) {
    navItems.push({
      slug: "home",
      label: "Home",
      href: shopHomePath(storefrontSlug, draft, basePath),
    });
  }
  if (enabledPages.includes("shop")) {
    navItems.push({
      slug: "shop",
      label: SHOP_LABEL[templateId],
      href: shopPagePath(storefrontSlug, "shop", draft, basePath),
    });
  }
  if (hasMenus) {
    navItems.push({
      slug: "menu",
      label: "Menus",
      href: shopMenusPath(storefrontSlug, draft, basePath),
    });
  }
  if (customNavPages.length > 0) {
    navItems.push(...customNavPages);
  } else {
    if (enabledPages.includes("about")) {
      navItems.push({
        slug: "about",
        label: templateId === "farmhouse" ? "Our farm" : "About",
        href: shopPagePath(storefrontSlug, "about", draft, basePath),
      });
    }
    if (enabledPages.includes("contact")) {
      navItems.push({
        slug: "contact",
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
    <header
      className={`${navClass} sticky top-0 z-30 border-b border-[var(--line)] bg-[var(--panel)]/95 backdrop-blur`}
    >
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
            <NavDropdown key={item.slug} item={item} />
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {cartCount > 0 ? (
            <Link
              href={standCartPath(standSlug)}
              className="studio-btn studio-btn--secondary text-sm"
            >
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
              <li key={item.slug}>
                {item.children?.length ? (
                  <div className="py-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                      {item.label}
                    </p>
                    <ul className="mt-1 flex flex-col">
                      {item.children.map((child) => (
                        <li key={child.slug}>
                          <Link
                            href={child.href}
                            className="block py-2 text-sm font-semibold text-[var(--field)]"
                            onClick={() => setOpen(false)}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={`block py-2 text-sm font-semibold text-[var(--field)] ${
                      activePage === item.slug ? "underline" : ""
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
