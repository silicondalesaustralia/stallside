"use client";

import type { ReactNode } from "react";
import StorefrontNav from "@/components/storefront/StorefrontNav";
import StorefrontFontLoader from "@/components/storefront/StorefrontFontLoader";
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
      <StorefrontFontLoader fontPairId={branding.fontPairId} />
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
        <div className="pb-28">{children}</div>
      </StorefrontLinkProvider>
    </div>
  );
}
