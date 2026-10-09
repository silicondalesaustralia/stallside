import Link from "next/link";
import type { ResolvedStorefrontBranding } from "@/lib/storefront/types";
import type { StorefrontPageId } from "@/lib/storefront/types";
import { shopHomePath, shopPagePath } from "@/lib/storefront/paths";
import type { StudioTemplateId } from "@/lib/studio/types";
import { resolveStudioTemplate } from "@/lib/studio/templates";
import { isWebsiteDemoStorefrontSlug } from "@/lib/demo";
import type { FooterColumnId } from "@/lib/studio/custom-pages";
import { FOOTER_COLUMNS } from "@/lib/studio/custom-pages";

type FooterLink = { label: string; href: string; column?: FooterColumnId };

export default function StudioStorefrontFooter({
  branding,
  storefrontSlug,
  enabledPages,
  draft,
  basePath,
  templateId,
  customFooterPages = [],
}: {
  branding: ResolvedStorefrontBranding;
  storefrontSlug: string;
  enabledPages: StorefrontPageId[];
  draft?: boolean;
  basePath?: string;
  templateId: StudioTemplateId;
  customFooterPages?: FooterLink[];
}) {
  const isDemoStore = isWebsiteDemoStorefrontSlug(storefrontSlug);
  const template = resolveStudioTemplate(templateId, "FOOD_BUSINESS");

  const fallbackLinks: FooterLink[] = [];
  if (enabledPages.includes("shop")) {
    fallbackLinks.push({
      label: "Shop All",
      href: shopPagePath(storefrontSlug, "shop", draft, basePath),
      column: "shop",
    });
  }
  if (enabledPages.includes("about")) {
    fallbackLinks.push({
      label: templateId === "farmhouse" ? "Our farm" : "About",
      href: shopPagePath(storefrontSlug, "about", draft, basePath),
      column: "visit",
    });
  }
  if (enabledPages.includes("contact")) {
    fallbackLinks.push({
      label: "Contact",
      href: shopPagePath(storefrontSlug, "contact", draft, basePath),
      column: "visit",
    });
  }

  const links: FooterLink[] =
    customFooterPages.length > 0 ? customFooterPages : fallbackLinks;

  const byColumn = (col: FooterColumnId) =>
    links.filter((l) => (l.column ?? "visit") === col);

  const shopLinks = [
    {
      label: "Shop All",
      href: shopPagePath(storefrontSlug, "shop", draft, basePath),
    },
    ...byColumn("shop"),
  ];
  // Dedupe Shop All if already in custom list
  const shopSeen = new Set<string>();
  const shopUnique = shopLinks.filter((l) => {
    if (shopSeen.has(l.href)) return false;
    shopSeen.add(l.href);
    return true;
  });

  const footerClass =
    template.footerVariant === "editorial-dark"
      ? "studio-footer studio-footer--artisan-dark"
      : template.footerVariant === "farm-location"
        ? "studio-footer studio-footer--farmhouse"
        : "studio-footer studio-footer--market";

  return (
    <footer className={footerClass}>
      <div className="mx-auto max-w-[var(--studio-content-max)] px-4 py-12 sm:px-8 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="studio-footer__brand">{branding.businessName}</p>
            {branding.subheadline ? (
              <p className="mt-2 max-w-xs text-sm leading-relaxed opacity-80">
                {branding.subheadline}
              </p>
            ) : null}
            {branding.regionLabel ? (
              <p className="mt-3 text-sm opacity-75">{branding.regionLabel}</p>
            ) : null}
            <p className="mt-4">
              <a
                href={`mailto:${branding.contactEmail}`}
                className="text-sm font-medium hover:underline"
              >
                {branding.contactEmail}
              </a>
            </p>
          </div>

          {FOOTER_COLUMNS.map((col) => {
            const colLinks =
              col.id === "shop"
                ? shopUnique
                : byColumn(col.id);
            if (colLinks.length === 0) return null;
            return (
              <div key={col.id}>
                <p className="text-xs font-bold uppercase tracking-wide opacity-60">
                  {col.label}
                </p>
                <ul className="mt-3 space-y-2">
                  {colLinks.map((l) => (
                    <li key={`${col.id}-${l.href}`}>
                      <Link
                        href={l.href}
                        className="text-sm font-medium hover:underline"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        <p className="mt-10 border-t border-current/15 pt-6 text-xs opacity-70">
          © {new Date().getFullYear()} {branding.businessName}
          {" · "}
          <Link
            href={shopHomePath(storefrontSlug, draft, basePath)}
            className="hover:underline"
          >
            Home
          </Link>
          {isDemoStore
            ? " — Green Valley Farm & Bakes is a fictional store created to demonstrate Vendl."
            : null}
        </p>
      </div>
    </footer>
  );
}
