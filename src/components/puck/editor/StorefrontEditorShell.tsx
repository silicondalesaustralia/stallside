"use client";

import type { ReactNode } from "react";
import StorefrontNav from "@/components/storefront/StorefrontNav";
import { storefrontThemeStyle } from "@/lib/storefront/branding";
import type { ResolvedStorefrontBranding } from "@/lib/storefront/types";
import type { StorefrontPageId } from "@/lib/storefront/types";
import { StorefrontLinkProvider } from "@/components/storefront/StorefrontLinkProvider";

const DEFAULT_PAGES: StorefrontPageId[] = [
  "home",
  "shop",
  "about",
  "contact",
];

export default function StorefrontEditorShell({
  branding,
  storefrontSlug,
  standSlug,
  basePath,
  enabledPages = DEFAULT_PAGES,
  children,
}: {
  branding: ResolvedStorefrontBranding;
  storefrontSlug: string;
  standSlug: string;
  basePath: string;
  enabledPages?: StorefrontPageId[];
  children: ReactNode;
}) {
  return (
    <div
      className="min-h-full bg-[var(--wash)] text-[var(--ink)]"
      style={storefrontThemeStyle(branding)}
    >
      <StorefrontLinkProvider slug={storefrontSlug} basePath={basePath} draft>
        <StorefrontNav
          storefrontSlug={storefrontSlug}
          standSlug={standSlug}
          branding={branding}
          activePage="home"
          enabledPages={enabledPages}
          draft
          basePath={basePath}
        />
        <main>{children}</main>
        <footer className="border-t border-[var(--line)] bg-[var(--panel)] px-4 py-10 text-center text-sm text-[var(--muted)]">
          <p className="font-semibold text-[var(--field)]">{branding.businessName}</p>
          {branding.regionLabel ? (
            <p className="mt-1">{branding.regionLabel}</p>
          ) : null}
          <p className="mt-3">
            <a href={`mailto:${branding.contactEmail}`} className="underline">
              Contact
            </a>
          </p>
        </footer>
      </StorefrontLinkProvider>
    </div>
  );
}
