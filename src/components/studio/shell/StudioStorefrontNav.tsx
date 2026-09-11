"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useSyncExternalStore, useCallback, type ReactNode } from "react";
import {
  cartItemCount,
  getStandCartEpoch,
  readStandCartLines,
  subscribeStandCart,
} from "@/lib/stand-cart-storage";
import { standCartPath } from "@/lib/stand-seo";
import { shopHomePath, shopMenusPath, shopPagePath } from "@/lib/storefront/paths";
import type { StorefrontPageId, ResolvedStorefrontBranding } from "@/lib/storefront/types";
import type { StudioTemplateId } from "@/lib/studio/types";
import type { StudioNavItem } from "@/lib/studio/navigation";
import { resolveStudioTemplate } from "@/lib/studio/templates";
import type { BrandMarkMode, HeaderLayout } from "@/lib/storefront/header-style";

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
      <button type="button" className="studio-nav__link inline-flex items-center gap-1" aria-haspopup="menu">
        {item.label}
        <span aria-hidden className="text-[10px]">▾</span>
      </button>
      <div className="invisible absolute left-0 top-full z-40 min-w-[10rem] pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        <ul role="menu" className="rounded-lg border border-[var(--line)] bg-[var(--panel)] py-1 shadow-md">
          {item.children.map((child) => (
            <li key={child.slug} role="none">
              <Link role="menuitem" href={child.href} className="block px-3 py-2 text-sm text-[var(--field)] hover:bg-[var(--wash)]">
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function BrandMark({
  branding,
  brandMark,
  href,
}: {
  branding: ResolvedStorefrontBranding;
  brandMark: BrandMarkMode;
  href: string;
}) {
  const hasLogo = Boolean(branding.logoUrl);
  const showLogo =
    hasLogo && (brandMark === "logo-and-name" || brandMark === "logo-only");
  const showName =
    brandMark === "name-only" ||
    brandMark === "logo-and-name" ||
    (!hasLogo && brandMark === "logo-only");

  return (
    <Link href={href} className="flex min-w-0 items-center gap-3" onClick={(e) => e.stopPropagation()}>
      {showLogo && branding.logoUrl ? (
        <Image
          src={branding.logoUrl}
          alt={showName ? "" : branding.headline}
          width={120}
          height={48}
          className="h-9 w-auto max-w-[140px] object-contain"
        />
      ) : null}
      {showName ? (
        <span className="studio-nav__brand truncate">{branding.headline}</span>
      ) : null}
    </Link>
  );
}

function buildNavItems(input: {
  enabledPages: StorefrontPageId[];
  storefrontSlug: string;
  draft?: boolean;
  basePath?: string;
  templateId: StudioTemplateId;
  hasMenus?: boolean;
  customNavPages: StudioNavItem[];
}): StudioNavItem[] {
  const items: StudioNavItem[] = [];
  const { enabledPages, storefrontSlug, draft, basePath, templateId, hasMenus, customNavPages } =
    input;
  if (enabledPages.includes("home")) {
    items.push({ slug: "home", label: "Home", href: shopHomePath(storefrontSlug, draft, basePath) });
  }
  if (enabledPages.includes("shop")) {
    items.push({
      slug: "shop",
      label: SHOP_LABEL[templateId],
      href: shopPagePath(storefrontSlug, "shop", draft, basePath),
    });
  }
  if (hasMenus) {
    items.push({ slug: "menu", label: "Menus", href: shopMenusPath(storefrontSlug, draft, basePath) });
  }
  if (customNavPages.length > 0) {
    items.push(...customNavPages);
  } else {
    if (enabledPages.includes("about")) {
      items.push({
        slug: "about",
        label: templateId === "farmhouse" ? "Our farm" : "About",
        href: shopPagePath(storefrontSlug, "about", draft, basePath),
      });
    }
    if (enabledPages.includes("contact")) {
      items.push({
        slug: "contact",
        label: "Contact",
        href: shopPagePath(storefrontSlug, "contact", draft, basePath),
      });
    }
  }
  return items;
}

function MobileNavList({
  navItems,
  activePage,
  onNavigate,
}: {
  navItems: StudioNavItem[];
  activePage: string;
  onNavigate: () => void;
}) {
  return (
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
                      onClick={onNavigate}
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
              onClick={onNavigate}
            >
              {item.label}
            </Link>
          )}
        </li>
      ))}
    </ul>
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
  editable,
  selected,
  onSelect,
  headerLayout: layoutOverride,
  brandMark: markOverride,
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
  editable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  headerLayout?: HeaderLayout;
  brandMark?: BrandMarkMode;
}) {
  const [open, setOpen] = useState(false);
  const template = resolveStudioTemplate(templateId, "FOOD_BUSINESS");
  const headerLayout = layoutOverride ?? branding.headerLayout;
  const brandMark = markOverride ?? branding.brandMark;
  const subscribe = useCallback(
    (onStoreChange: () => void) => subscribeStandCart(onStoreChange),
    [],
  );
  const getSnapshot = useCallback(() => {
    void getStandCartEpoch();
    return cartItemCount(readStandCartLines(standSlug));
  }, [standSlug]);
  const cartCount = useSyncExternalStore(subscribe, getSnapshot, () => 0);

  const navItems = buildNavItems({
    enabledPages,
    storefrontSlug,
    draft,
    basePath,
    templateId,
    hasMenus,
    customNavPages,
  });

  const navClass =
    template.headerVariant === "editorial"
      ? "studio-nav studio-nav--artisan"
      : template.headerVariant === "farm-gate"
        ? "studio-nav studio-nav--farmhouse"
        : "studio-nav studio-nav--market";

  const homeHref = shopHomePath(storefrontSlug, draft, basePath);
  const brand = <BrandMark branding={branding} brandMark={brandMark} href={homeHref} />;
  const desktopNav =
    headerLayout === "minimal" ? null : (
      <nav className="hidden items-center gap-6 md:flex" aria-label="Main" onClick={(e) => e.stopPropagation()}>
        {navItems.map((item) => (
          <NavDropdown key={item.slug} item={item} />
        ))}
      </nav>
    );
  const actions = (
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
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
  );

  let body: ReactNode;
  if (headerLayout === "centred") {
    body = (
      <div className="mx-auto grid max-w-[var(--studio-content-max)] grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-3 sm:px-8 sm:py-4">
        <div className="hidden justify-self-start md:block">{desktopNav}</div>
        <div className="col-start-2 justify-self-center">{brand}</div>
        <div className="justify-self-end">{actions}</div>
      </div>
    );
  } else if (headerLayout === "stacked") {
    body = (
      <div className="mx-auto flex max-w-[var(--studio-content-max)] flex-col gap-2 px-4 py-3 sm:px-8 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          {brand}
          {actions}
        </div>
        <div className="flex justify-center border-t border-[var(--line)] pt-2">{desktopNav}</div>
      </div>
    );
  } else if (headerLayout === "minimal") {
    body = (
      <div className="mx-auto flex max-w-[var(--studio-content-max)] items-center justify-between gap-4 px-4 py-2.5 sm:px-8">
        {brand}
        {actions}
      </div>
    );
  } else {
    body = (
      <div className="mx-auto flex max-w-[var(--studio-content-max)] items-center justify-between gap-4 px-4 py-3 sm:px-8 sm:py-4">
        {brand}
        {templateId === "farmhouse" && branding.regionLabel ? (
          <p className="hidden text-sm text-[var(--muted)] lg:block">{branding.regionLabel}</p>
        ) : null}
        {desktopNav}
        {actions}
      </div>
    );
  }

  return (
    <header
      className={`${navClass} sticky top-0 z-30 border-b border-[var(--line)] bg-[var(--panel)]/95 backdrop-blur ${
        selected ? "ring-2 ring-inset ring-[var(--leaf)]" : ""
      } ${editable ? "cursor-pointer" : ""}`}
      onClick={
        editable
          ? (e) => {
              e.stopPropagation();
              onSelect?.();
            }
          : undefined
      }
      role={editable ? "button" : undefined}
      tabIndex={editable ? 0 : undefined}
      onKeyDown={
        editable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect?.();
              }
            }
          : undefined
      }
      aria-label={editable ? "Edit header style" : undefined}
    >
      {body}
      {open ? (
        <nav className="border-t border-[var(--line)] px-4 py-3 md:hidden" aria-label="Mobile">
          <MobileNavList
            navItems={navItems}
            activePage={activePage}
            onNavigate={() => setOpen(false)}
          />
        </nav>
      ) : null}
    </header>
  );
}
